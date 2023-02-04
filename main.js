const express = require("express");
const cors = require("cors");
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const bodyParser = require('body-parser');
require('dotenv').config()
const port = 3001;
const app = express()
const notion = new Client({
  auth: process.env.TOKEN,
})
const n2m = new NotionToMarkdown({ notionClient: notion });

app.use(bodyParser.json())
app.use(cors())


app.get('/', (req, res) => {
  res.json("working")
})

app.get('/all', (req, res) => {
  async function run() {
    try {
      const response = await notion.databases.query({
        database_id: process.env.DATABASE,
        filter: {
          property: 'Status',
          checkbox: {
            equals: true
          }
        },
        sorts: [
          {
            property: "Date",
            direction: "ascending"
          }
        ]
      })
      const blogs = []


      response.results.forEach((e, i) => {
        blogs.push({
          id: e.id,
          cover: e.cover ? e.cover.external.url : null,
          author: e.properties.author.rich_text[0] ? e.properties.author.rich_text[0].plain_text : null,
          authorLink: e.properties.authorLink.rich_text[0] ? e.properties.authorLink.rich_text[0].plain_text : null,
          tags: e.properties.Tags.multi_select,
          date: e.properties.Date.date ? e.properties.Date.date.start : null,
          title: e.properties.Name.title[0] ? e.properties.Name.title[0].plain_text : null,
          description: e.properties.content.rich_text[0] ? e.properties.content.rich_text[0].plain_text : null,
          comments: e.properties.comments.multi_select
        })
      })
      res.send(blogs)

    } catch (error) {
      console.log(error)
    }
  }
  run();
})

app.get('/filter/:key', (req, res) => {
  async function run() {
    try {
      const keyword = req.params.key;
      const response = await notion.databases.query({
        database_id: process.env.DATABASE,
        filter: {
          and: [
            {
              property: 'Status',
              checkbox: {
                equals: true
              }
            },
            {
              property: 'Tags',
              multi_select: {
                contains: keyword
              }
            }
          ]
        },
        sorts: [
          {
            property: "Date",
            direction: "ascending"
          }
        ]
      })
      const blogs = []


      response.results.forEach((e, i) => {
        blogs.push({
          id: e.id,
          cover: e.cover ? e.cover.external.url : null,
          author: e.properties.author.rich_text[0] ? e.properties.author.rich_text[0].plain_text : null,
          authorLink: e.properties.authorLink.rich_text[0] ? e.properties.authorLink.rich_text[0].plain_text : null,
          tags: e.properties.Tags.multi_select,
          date: e.properties.Date.date ? e.properties.Date.date.start : null,
          title: e.properties.Name.title[0] ? e.properties.Name.title[0].plain_text : null,
          description: e.properties.content.rich_text[0] ? e.properties.content.rich_text[0].plain_text : null
        })
      })
      res.send(blogs)

    } catch (error) {
      console.log(error)
    }
  }
  run();
})

app.get('/search/:key', (req, res) => {
  async function run() {
    try {
      const keyword = req.params.key;
      const response = await notion.databases.query({
        database_id: process.env.DATABASE,
        filter: {
          and: [
            {
              property: 'Status',
              checkbox: {
                equals: true
              }
            },
            {
              or: [
                {
                  property: 'Name',
                  title: {
                    contains: keyword
                  }
                },
                {
                  property: 'content',
                  rich_text: {
                    contains: keyword
                  }
                }
              ]
            }

          ]
        },
        sorts: [
          {
            property: "Date",
            direction: "ascending"
          }
        ]
      })
      const blogs = []


      response.results.forEach((e, i) => {
        blogs.push({
          id: e.id,
          cover: e.cover ? e.cover.external.url : null,
          author: e.properties.author.rich_text[0] ? e.properties.author.rich_text[0].plain_text : null,
          authorLink: e.properties.authorLink.rich_text[0] ? e.properties.authorLink.rich_text[0].plain_text : null,
          tags: e.properties.Tags.multi_select,
          date: e.properties.Date.date ? e.properties.Date.date.start : null,
          title: e.properties.Name.title[0] ? e.properties.Name.title[0].plain_text : null,
          description: e.properties.content.rich_text[0] ? e.properties.content.rich_text[0].plain_text : null
        })
      })
      res.send(blogs)

    } catch (error) {
      console.log(error)
    }
  }
  run();
})

app.get('/post/:id', (req, res) => {
  async function run() {
    try {
      // const mdblocks = await n2m.pageToMarkdown(req.params.id);
      // const mdString = n2m.toMarkdownString(mdblocks);
      const e = await notion.pages.retrieve({ page_id: req.params.id });
      const blocks = await notion.blocks.children.list({
        block_id: req.params.id
      });
      // res.send(response)
      res.json({
        cover: e.cover ? e.cover.external.url : null,
        author: e.properties.author.rich_text[0] ? e.properties.author.rich_text[0].plain_text : null,
        authorLink: e.properties.authorLink.rich_text[0] ? e.properties.authorLink.rich_text[0].plain_text : null,
        tags: e.properties.Tags.multi_select,
        date: e.properties.Date.date ? e.properties.Date.date.start : null,
        title: e.properties.Name.title[0] ? e.properties.Name.title[0].plain_text : null,
        description: e.properties.content.rich_text[0] ? e.properties.content.rich_text[0].plain_text : null,
        comments: e.properties.comments.multi_select,
        blocks: blocks.results
      })

    } catch (error) {
      console.log(error)
    }
  }
  run();
})

app.post('/comment', (req, res) => {
  async function run() {
    try {
      const { comments, id } = req.body;
      const response = await notion.pages.update({
        page_id: id,
        properties: {
          comments: {
            multi_select: comments
          },
        },
      });
      res.json("comment added")
    } catch (error) {
      console.log(error)
    }
  }
  run();
})

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})