/* eslint-disable import/no-anonymous-default-export */
export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "date", type: "datetime" },
    { name: "place", type: "string" },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
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
    {
      name: "color",
      title: "Color",
      description: "input HEX Color Code",
      type: "string",
    },
    {
      name: "productImage",
      title: "Product image",
      type: "image",
      options: {
        hotspot: true,
      },
      description:
        "image shown in 'Others have looked at' list and unveils main image on hover",
    },
    {
      name: "imageMap",
      title: "image Map",
      type: "string",
      description: "export imagemap and attach for better link appearance",
    },

    {
      name: "imagesGallery",
      title: "Images gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: "recap",
      title: "Recap",
      type: "blockContent",
    },
    {
      name: "body",
      title: "Body",
      type: "blockContent",
    },

    {
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    },
    {
      name: "Link",
      type: "url",
    },
    {
      name: "tags",
      type: "array",
      of: [
        {
          type: "string",
        },
      ],
      options: {
        layout: "tags",
      },
    },
  ],
};
