export const byName = (left: AmResource, right: AmResource) =>
  left.attributes.name.localeCompare(right.attributes.name);
