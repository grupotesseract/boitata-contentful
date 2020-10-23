import React from 'react';
import {
  Asset,
} from '@contentful/forma-36-react-components';


interface ImagePickerProps {
  images: object,
  selectedImage: string,
  onClick: Function,
}

const ImagePicker = (props: ImagePickerProps) => {
  const { images, selectedImage, onClick } = props;

  return (
    <div className='image-picker'>
      {Object.entries(images).map(([size, url]) => {
        const isSelected = url === selectedImage;

        return (
          <div
            className={`container${isSelected ? ' selected' : ''}`}
            onClick={() => onClick(url)}
          >
            <Asset
              src={url}
              key={size}
              title={size}
              type='image'
              className={`thumbnail${isSelected ? ' selected' : ''}`}
            />
            <div className='checked'>
              <div className='icon'/>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default ImagePicker;
