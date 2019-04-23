/** creates an element and assigns props to it */
export function createElement(
  document: Document,
  tagName: string,
  {
    style,
    ...props
  }: {
    style?: {[styleProp: string]: string | number};
    [propName: string]: unknown;
  } = {},
) {
  const element = document.createElement(tagName);
  Object.assign(element, props);
  if (style) {
    Object.assign(element.style, style);
  }
  return element;
}
