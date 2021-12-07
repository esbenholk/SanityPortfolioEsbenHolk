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
