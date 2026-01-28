const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
const mkdirp = require('mkdirp')
const AWS = require('aws-sdk')

dotenv.config({path: `${__dirname}/../../../.env`})

const isOfflineBuild = process.env.SKIP_AWS_FETCH === '1' || process.env.SKIP_AWS_FETCH === 'true'

const writeOutputs = (outputs) => {
  const json = JSON.stringify(outputs, null, 2)
  const buildDir = path.normalize(`${__dirname}/../build`)
  mkdirp.sync(buildDir)
  fs.writeFileSync(`${buildDir}/aws_resource_ids.json`, json)
  console.log('aws_resource_ids.json created')
}

if (isOfflineBuild) {
  writeOutputs([
    {
      OutputKey: 'LambdaRoleArn',
      OutputValue: process.env.LAMBDA_ROLE_ARN || 'arn:aws:iam::000000000000:role/OfflineBuildRole'
    }
  ])
  process.exit(0)
}

const describeStack = (cloudFormation, stackName) => {
  return new Promise((resolve, reject) => {
    const params = {
      StackName: stackName
    }
    cloudFormation.describeStacks(params, (error, data) => {
      if (error) {
        return reject(error)
      }
      if (!data) {
        return reject(new Error('describeStacks returned no data'))
      }
      const { Stacks: stacks } = data
      if (!stacks || stacks.length !== 1) {
        return reject(new Error('describeStacks unexpected number of stacks'))
      }
      const stack = stacks[0]
      resolve(stack)
    })
  })
}

const { STACK_NAME: stackName, AWS_REGION: region } = process.env
const cloudFormation = new AWS.CloudFormation({ region })

describeStack(cloudFormation, stackName).then((stack) => {
  return JSON.stringify(stack.Outputs, null, 2)
}).then((json) => {
  writeOutputs(JSON.parse(json))
}).catch((error) => {
  console.error(error, error.stack)
  process.exit(1)
})
