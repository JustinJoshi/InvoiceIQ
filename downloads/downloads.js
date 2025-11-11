const express = require('express')
const fs = require('fs')

console.log(fs.readFile(__dirname + 'resume.pdf'))

module.exports = fs.readFile(__dirname + 'resume.pdf')