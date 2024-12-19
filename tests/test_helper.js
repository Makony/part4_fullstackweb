const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "Blog",
    author: "Author",
    url: "url",
    likes: 5
  },
  {
    title: "GYUH",
    author: "kfkfk",
    url: "kkd",
    likes: 6
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'temp', url: 'temp', likes: 0 })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb
}