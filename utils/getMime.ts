export const getMime = (path: string) => {
  const extension = path.split('.')[1] || 'html'

  switch (extension) {
    case 'js':
      return 'text/javascript';
    case 'svg':
      return 'image/svg+xml';
    case 'jpeg':
    case 'gif':
    case 'png':
    case 'webp':
      return 'image/' + extension
    default:
      return 'text/' + extension;
  }
}