/* eslint-disable import/no-anonymous-default-export */

// Fake ads ("commercials") scattered at random into the website's header and columns
export default {
  name: "commercial",
  title: "Commercial",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Only for the studio and screen readers",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "image",
      title: "Image or GIF",
      type: "image",
      description: "JPG, PNG or animated GIF (GIFs keep animating on the site)",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "project",
      title: "Links to project",
      type: "reference",
      to: [{ type: "project" }],
    },
    {
      name: "url",
      title: "…or links to",
      type: "string",
      description:
        "Used when no project is picked: a page on the site like /instagram or /chaos, or a full https:// link. Leave both empty for no link.",
    },
    {
      name: "placements",
      title: "Can appear in",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Header", value: "header" },
          { title: "Left column", value: "left" },
          { title: "Centre column", value: "center" },
          { title: "Right column", value: "right" },
        ],
      },
      description: "Leave empty to let it appear anywhere",
    },
    {
      name: "active",
      title: "Show on the site",
      type: "boolean",
      initialValue: true,
    },
  ],

  preview: {
    select: {
      title: "title",
      media: "image",
      active: "active",
      placements: "placements",
    },
    prepare({ title, media, active, placements }) {
      const where = placements && placements.length ? placements.join(", ") : "anywhere";
      return {
        title,
        media,
        subtitle: active === false ? "hidden" : where,
      };
    },
  },
};
