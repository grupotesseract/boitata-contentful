import fetchJsonp from 'fetch-jsonp';

const BASE_URL = 'https://api.behance.net/v2/users/coletivoboitata'

export const getProjects = () => {
  const url = `${BASE_URL}/projects?client_id=${process.env.REACT_APP_BEHANCE_API_KEY}`;

  return fetchJsonp(url)
    .then(({ json }) => {
      return json().then(({ projects }) => {
        return projects;
      })
    });
};

export const getProject = (projectId) => {
  const url = `https://api.behance.net/v2/projects/${projectId}?client_id=${process.env.REACT_APP_BEHANCE_API_KEY}`;

  return fetchJsonp(url)
    .then(({ json }) => {
      return json().then(({ project }) => {
        return project;
      })
    });
};
