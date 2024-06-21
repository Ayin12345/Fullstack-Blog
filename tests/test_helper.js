const Blog = require('../models/blogs')
const User = require('../models/users')

const initialBlogs = [
    { _id: "5a422a851b54a676234d17f7", title: "Random Blog", author: "Aleksei Yin", url: "https://alekseiyin.com/", likes: 12, __v: 0 },
    { _id: "5a422aa71b54a676234d17f8", title: "Second Blog", author: "Maksim Yin", url: "http://www.maksimyin.com/", likes: 30, __v: 0 }
  ]

  const initialUser = { "username": "test1", "name": "test1", "password": "test1" }

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}
const usersInDb = async () => {
  let users = await User.find({})
  return users.map(user => user.toJSON())
}

  
  
module.exports = {
  initialBlogs, initialUser, blogsInDb, usersInDb
}