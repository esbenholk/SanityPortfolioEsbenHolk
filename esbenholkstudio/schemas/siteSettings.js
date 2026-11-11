/* eslint-disable import/no-anonymous-default-export */

export default {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Site Title",
      type: "string",
    },
    {
      name: "titleImage",
      title: "title image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "textureImages",
      title: "Texture images",
      description:
        "For the TEXTURED skin: these images (or GIFs) cover every background on the site. Leave empty to use a random mix of project images.",
      type: "array",
      of: [{ type: "image" }],
      options: { layout: "grid" },
    },
    {
      name: "vibeImages",
      title: "Vibe check images",
      description:
        "The 'select all images that match your vibe' test on a visitor's first visit picks their starting skin. Tag each image with the skin it stands for. Nine are shown: 1 computer, 1 textured, 1 ocean, 2 internet nostalgia, 2 minimal, 2 sexy (picked at random when you add more). Missing ones are drawn stand-ins.",
      type: "array",
      of: [
        {
          type: "object",
          name: "vibeImage",
          fields: [
            { name: "image", title: "Image or GIF", type: "image" },
            {
              name: "skin",
              title: "Stands for",
              type: "string",
              options: {
                list: [
                  { title: "Computer", value: "computer" },
                  { title: "Ocean", value: "ocean" },
                  { title: "Textured", value: "texture" },
                  { title: "Internet nostalgia (I miss the internet)", value: "storefront" },
                  { title: "Sexy (tube)", value: "tube" },
                  { title: "Minimal", value: "minimal" },
                ],
              },
            },
          ],
          preview: {
            select: { title: "skin", media: "image" },
          },
        },
      ],
    },
    {
      name: "greeting",
      title: "Site Greeting",
      type: "blockContent",
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
      name: "backgroundImage",
      title: "Background image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "mainImages",
      title: "Frontpage Images",
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
      name: "authorImage",
      title: "Profile image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "featuredProjects",
      title: "Projects in Landing Page Slider",
      description:
        "input project names to create Slider of Featured Projects, which replaces Main Image",

      type: "array",
      of: [
        {
          name: "projectName",
          title: "Project Name",
          type: "string",
        },
      ],
    },
    {
      name: "logo",
      title: "Logo",
      type: "image",
    },
    {
      name: "footerlogo",
      title: "Footer Logo",
      type: "image",
    },
    {
      name: "contact",
      title: "Contact",
      type: "blockContent",
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "about",
      title: "About Me",
      type: "blockContent",
    },

    {
      name: "body",
      title: "Body",
      type: "blockContent",
    },
    {
      name: "socialMediaHandles",
      title: "Social Media Handles",
      type: "array",
      of: [
        {
          title: "Social Media Handle",
          name: "socialMediaHandle",
          type: "object",
          fields: [
            {
              title: "URL",
              name: "url",
              type: "url",
            },
            {
              name: "logo",
              title: "Logo",
              type: "image",
            },
            {
              name: "URLName",
              title: "URL Name",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
};
