import React, { useState, useEffect } from 'react';
import {
  DisplayText,
  TextField,
  SelectField,
  Option,
  Subheading,
  Textarea,
  FormLabel,
  HelpText,
  Spinner,
} from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import { getProjects, getProject } from '../services/api';
import ImagePicker from './ImagePicker';

interface EditorProps {
  sdk: EditorExtensionSDK;
}

interface BehanceProjectModule {
  id: any,
  sizes: object;
}

interface BehanceProject {
  id: string;
  slug: string
  name: string;
  description: string,
  covers: object;
  tags: string;
  modules: Array<BehanceProjectModule>;
}

const defaultSelectedProject = {
  id: '',
  slug: '',
  name: '',
  description: '',
  covers: {},
  tags: '',
  modules: [],
  images: {}
};

const Entry = (props: EditorProps) => {
  const { fields } = props.sdk.entry;

  const [projectId, setProjectId] = useState('');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [cover, setCover] = useState('')
  const [images, setImages] = useState({})

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<BehanceProject>(defaultSelectedProject)

  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingSelectProject, setIsLoadingSelectProject] = useState(false)

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    const newProjects = await getProjects();
    setIsLoadingProjects(false);
    setProjects(newProjects);
  }

  const updateSelectedProject = async (id, { isDirty = false } = {}) => {
    if (!Boolean(id)) {
      return null;
    }

    setIsLoadingSelectProject(true);
    const newSelectedProject = await getProject(id);
    setSelectedProject(newSelectedProject);

    if (isDirty) {
      updateSlug(newSelectedProject.slug);
      updateName(newSelectedProject.name);
      updateDescription(newSelectedProject.description);
      updateTags(newSelectedProject.tags)
      updateCover(newSelectedProject.cover)
      updateImages({});
    } else {
      const contentfulImages = fields.images.getValue();
      if (!contentfulImages) {
        setIsLoadingSelectProject(false);
        return null;
      }

      const newImages = {};
      contentfulImages.forEach(image => {
        const module = newSelectedProject.modules.filter(module => Boolean(module.sizes)).find(module => Object.values(module.sizes).includes(image));
        newImages[module.id] = image;
      });
      setImages(newImages);
    }

    setIsLoadingSelectProject(false);
  }

  useEffect(() => {
    const newProjectId = fields.projectId.getValue();

    setProjectId(newProjectId);
    setName(fields.name.getValue());
    setCover(fields.cover.getValue());
    setSlug(fields.slug.getValue());
    setDescription(fields.description.getValue());
    setTags(fields.tags.getValue());

    loadProjects();
    updateSelectedProject(newProjectId);
  }, []);

  const onProjectIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newProjectId = event.target.value;
    fields.projectId.setValue(newProjectId);
    setProjectId(newProjectId);
    updateSelectedProject(newProjectId, { isDirty: true });
  }

  const updateName = (value) => {
    fields.name.setValue(value);
    setName(value);
  }

  const updateSlug = (value) => {
    fields.slug.setValue(value);
    setSlug(value);
  }

  const updateDescription = (value) => {
    fields.description.setValue(value);
    setDescription(value)
  }

  const updateTags = (value) => {
    fields.tags.setValue(value);
    setTags(value)
  }

  const updateCover = (value) => {
    fields.cover.setValue(value);
    setCover(value)
  }

  const updateImages = (images) => {
    const contentfulImages = Object.entries(images).map(([_moduleId, image]) => image);
    fields.images.setValue(contentfulImages);
    setImages(images);
  }

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateName(event.target.value);
  };

  const onSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSlug(event.target.value);
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDescription(event.target.value)
  };

  const onTagsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTags(event.target.value)
  };

  const onCoverClick = (cover) => {
    updateCover(cover)
  }

  const onImageClick = ({ moduleId, image }) => {
    let newImage = image;
    if (images[moduleId] === image) {
      newImage = null;
    }
    const newImages = Object.assign({}, images, { [moduleId]: newImage });
    updateImages(newImages);
  }

  if (isLoadingProjects) {
    return (
      <div className='spinner'>
        <Spinner
          size='large'
        />
      </div>
    )
  }

  return (
    <div className='entry-container'>
      <DisplayText>Novo Projeto</DisplayText>

      <div className='field'>
        <SelectField
          labelText='Selecione o projeto'
          required
          value={projectId}
          onChange={onProjectIdChange}
        >
          <Option value='' />
          {projects.map(project => (
            <Option key={project.id} value={project.id}>{project.name}</Option>
          ))}
        </SelectField>
      </div>

      <TextField
        labelText='Nome'
        required
        value={name}
        className='field'
        onChange={onNameChange}
      />

      <TextField
        labelText='slug'
        required
        value={slug}
        className='field'
        onChange={onSlugChange}
      />

      <div className='field'>
        <FormLabel htmlFor='description'>Descrição</FormLabel>
        <Textarea
          width='large'
          value={description}
          rows={10}
          onChange={onDescriptionChange}
        />
      </div>

      <div>
        <FormLabel htmlFor='tag'>Tags</FormLabel>
        <HelpText className='help-text'>Insira as categorias separadas com vírgula</HelpText>
        <TextField
          width='large'
          value={tags}
          className='tag'
          onChange={onTagsChange}
        />
      </div>

      {isLoadingSelectProject ? (
        <div className='spinner'>
          <Spinner
            size='large'
          />
        </div>
      ):(
        <>
          <div className='images-container'>
            <Subheading>Selecione a capa</Subheading>
            <HelpText className='help-text'>Essa é a imagem que será exibida na página Portfólio</HelpText>
            <ImagePicker images={selectedProject.covers} selectedImage={cover} onClick={onCoverClick}/>
          </div>

          <div className='images-container'>
            <Subheading>Selecione as images</Subheading>
            <HelpText className='help-text'>Essas são as imagens que serão exibidas na página de Projeto</HelpText>

            {selectedProject.modules.filter(module => Boolean(module.sizes)).map(module => (
              <ImagePicker images={module.sizes} selectedImage={images[module.id]} onClick={(url)=> onImageClick({ moduleId: module.id, image: url })}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Entry;
