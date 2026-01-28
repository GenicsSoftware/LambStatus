import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

const buildDir = path.normalize(`${__dirname}/../build`)
const funcsDir = path.normalize(`${buildDir}/functions`)

const zipDirectory = (funcName) => new Promise((resolve, reject) => {
  const funcDir = path.join(funcsDir, funcName)
  const zipPath = path.join(buildDir, `${funcName}.zip`)
  const output = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`${funcName}.zip created`)
    resolve()
  })
  output.on('error', reject)
  archive.on('error', reject)

  archive.pipe(output)
  archive.directory(funcDir, false)
  archive.finalize()
})

const funcs = fs.readdirSync(funcsDir)
const run = async () => {
  for (const func of funcs) {
    await zipDirectory(func)
  }
}

run().catch((error) => {
  console.log(error.message)
  console.log(error.stack)
  process.exit(1)
})
