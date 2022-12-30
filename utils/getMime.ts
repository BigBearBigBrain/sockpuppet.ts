export const getMime = (path: string) => {
  const extension = path.split('.')[1] || 'html'

  switch (extension) {
    case 'js':
      return 'javascript';
    default:
      return extension;
  }
}