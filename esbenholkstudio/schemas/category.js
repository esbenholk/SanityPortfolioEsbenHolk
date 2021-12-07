/* eslint-disable import/no-anonymous-default-export */

export default {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "blockContent",
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        // add a button to generate slug from the title field
        source: "title",
      },
    },
  ],
};
