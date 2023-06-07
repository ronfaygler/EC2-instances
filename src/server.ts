import express, { Request, Response } from 'express';
import cors from 'cors';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { renderTable } from './tableRenderer';
dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });
  
  const app = express();
  const port = 3000;
  
  app.use(cors());
  app.use(express.json());
  
  app.get('/instances', async (req: Request, res: Response) => {
    try {
      const regions = req.query.region ? [req.query.region as string] : ['us-east-1', 'us-west-2']; // Default to multiple regions if no specific region is provided
      const instances: any[] = [];
  
      for (const region of regions) {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({});
        const ec2 = new AWS.EC2({ accessKeyId, secretAccessKey, region });
        const params = {
          Filters: [{ Name: 'instance-state-name', Values: ['running'] }],
        };
  
        const data = await ec2.describeInstances(params).promise();
        const regionInstances = parseInstanceData(data);
        instances.push(...regionInstances);
      }

      const sortBy=req.query.sortBy as string;
      const sortOrder= req.query.sortOrder as string || 'asc';
      if (sortBy){
        instances.sort((a,b) => {
            const valueA = a[sortBy];
            const valueB = b[sortBy];
            if (Array.isArray(valueA) && Array.isArray(valueB)){
                return sortOrder =='asc' ? valueA[0].localeCompare(valueB[0]) :  valueB[0].localeCompare(valueA[0]);
            }
            else if (typeof(valueA) == 'string' && typeof(valueB == 'string')){
                return sortOrder =='asc' ? valueA.localeCompare(valueB) :  valueB.localeCompare(valueA);
            }
            else {
                return sortOrder =='asc' ? valueA - valueB : valueB - valueA;
            }
        })
      }
  
      const tableHtml = renderTable(instances)
      res.send(tableHtml);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch EC2 instances.' });
    }
  });
  
  function parseInstanceData(data: AWS.EC2.DescribeInstancesResult): any[] {
    const instances: any[] = [];
  
    data.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        instances.push({
          name: getNameTag(instance),
          id: instance.InstanceId,
          type: instance.InstanceType,
          state: instance.State?.Name,
          az: instance.Placement?.AvailabilityZone,
          publicIp: instance.PublicIpAddress,
          privateIps: instance.NetworkInterfaces?.map((ni) => ni.PrivateIpAddress),
        });
      });
    });
  
    return instances;
  }
  
  
function getNameTag(instance: AWS.EC2.Instance): string {
    const tag = instance.Tags?.find((t) => t.Key === 'Name');
    return tag?.Value || '';
}

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


process.on("SIGINT", function () {
    if (server) {
        server.close(() => console.log("server closed"));
    }
    process.exit();
});

export default app;
