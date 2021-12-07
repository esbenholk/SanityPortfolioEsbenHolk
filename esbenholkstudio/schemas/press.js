/* eslint-disable import/no-anonymous-default-export */

export default {
  name: "press",
  title: "Press",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "url",
      title: "url",
      type: "url",
    },

    {
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    },
    {
      name: "year",
      title: "Year",
      type: "number",
    },
    {
      name: "yearString",
      title: "Note on Year",
      type: "string",
      description:
        "add comment here such as '-present' or 'forever'. It will be added in the list of projects",
    },
  ],

  preview: {
    select: {
      title: "title",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      });
    },
  },
};
