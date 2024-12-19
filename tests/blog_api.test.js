const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
  
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})


test('a valid blog can be added', async () => {
    const newBlog = {
      title: "new blog was added",
      author: "kfkfk",
      url: "kkd",
      likes: 6
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    const contents = blogsAtEnd.map(n => n.title)
    assert.strictEqual(contents.includes('new blog was added'), true)
  })

  test('likes property is missing', async () => {
    const newBlog = {
        title: "Blog without likes",
        author: "Author",
        url: "url"
      }
  
      const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const savedBlog = response.body
    assert.strictEqual(savedBlog.likes, 0)
  })

  test('unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    blogs.forEach(blog => {
        assert.strictEqual(typeof blog.id, 'string')
        assert.strictEqual(blog._id, undefined)
    })
})

test('blog without title is not added', async () => {
    const newBlog = {
      author: "Author",
      url: "url",
      likes: 5
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('blog without url is not added and returns 400', async () => {
    const newBlog = {
      title: "Blog without url",
      author: "Author",
      likes: 5
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

after(async () => {
  await mongoose.connection.close()
})