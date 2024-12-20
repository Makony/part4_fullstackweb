const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})


blogsRouter.post('/', async (request, response, next) => {
  const { title, author, url, likes, user } = request.body 
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  
  
  if (!title || !url) {
    return response.status(400).json({ error: 'Title or url is required' })
  }

  const foundUser = await User.findById(decodedToken.id)

    if (!foundUser) {
      return response.status(404).json({ error: 'User not found' }) // If user not found, return an error
    }

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes === undefined ? 0 : likes,
      user: foundUser._id 
    })


    const savedBlog = await blog.save()

    foundUser.blogs = foundUser.blogs.concat(savedBlog._id)
    await foundUser.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, user } = request.body

  const blog = {
    title,
    author,
    url,
    likes,
    user
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})


module.exports = blogsRouter