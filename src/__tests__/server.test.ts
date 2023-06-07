import request from 'supertest';
import app from '../server';
const cheerio = require('cheerio');


describe('GET /instances', () => {
  it('should return an Html table of EC2 instances', async () => {
  const response = await request(app).get('/instances');
  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  expect(response.text).toContain('<table>'); // Check if the response body contains the opening <table> tag
  expect(response.text).toContain('</table>'); // Check if the response body contains the closing </table> tag
  expect(response.text).toContain('<th>ID</th>');
  expect(response.text).toContain('i-04ffe933fa46f5318'); // check an existing id
  expect(response.text).toContain('44.202.96.47'); // 
});

  it('should return instances sorted by publicIp in ascending order', async () => {
    const sortBy = 'publicIp';
    const sortOrder = 'asc';
    const response = await request(app).get(`/instances?sortBy=${sortBy}&sortOrder=${sortOrder}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    const $ = cheerio.load(response.text);

    // Get the public IP values from the rendered table
    const publicIpCells = $('table tbody td:nth-child(6)');
    expect(publicIpCells.length).toBeGreaterThan(5);
    // Extract the public IP values as an array
    const publicIps = publicIpCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the public IPs are sorted in ascending order
    const sortedPublicIps = [...publicIps].sort();
    expect(publicIps).toEqual(sortedPublicIps);
  });


  it('should return instances in us-west-2 sorted by public IP in descending order', async () => {
    const sortBy = 'publicIp';
    const sortOrder = 'desc';
    const region = 'us-west-2'
    const response = await request(app).get(`/instances?region=${region}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    expect(response.status).toBe(200);

    const $ = cheerio.load(response.text);
    // Get the public IP values from the rendered table
    const publicIpCells = $('table tbody td:nth-child(6)');
    expect(publicIpCells.length).toBeLessThanOrEqual(6);
    // Extract the public IP values as an array
    const publicIps = publicIpCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the public IPs are sorted in descending order
    const sortedPublicIps = [...publicIps].sort().reverse();
    expect(publicIps).toEqual(sortedPublicIps);

    // Get the region values from the rendered table
    const regionCells = $('table tbody td:nth-child(5)');
    // Extract the region values as an array
    const regions = regionCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the regions start with "us-west-2"
    const isValidRegion = regions.every((region: string) => region.startsWith('us-west-2'));
    expect(isValidRegion).toBe(true);
  });

  it('should return instances sorted by name in descending order', async () => {
    const sortBy = 'name';
    const sortOrder = 'desc';
    const response = await request(app).get(`/instances?sortBy=${sortBy}&sortOrder=${sortOrder}`);
    expect(response.status).toBe(200);

    const $ = cheerio.load(response.text);
    // Get the public IP values from the rendered table
    const nameCells = $('table tbody td:nth-child(1)');
    expect(nameCells.length).toBeLessThanOrEqual(6);
    // Extract the public IP values as an array
    const names = nameCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the public IPs are sorted in descending order
    const sortedNames = [...names].sort().reverse();
    expect(names).toEqual(sortedNames);
  });

  
  it('should return instances only in us-east-1 sorted by name in ascending order', async () => {
    const sortBy = 'name';
    const region = 'us-east-1';
    const response = await request(app).get(`/instances?region=${region}&sortBy=${sortBy}`);
    expect(response.status).toBe(200);

    const $ = cheerio.load(response.text);
    // Get the public IP values from the rendered table
    const nameCells = $('table tbody td:nth-child(1)');
    expect(nameCells.length).toBeLessThanOrEqual(3);
    // Extract the public IP values as an array
    const names = nameCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the public IPs are sorted in descending order
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
    
    // Get the region values from the rendered table
    const regionCells = $('table tbody td:nth-child(5)');
    // Extract the region values as an array
    const regions = regionCells.map((_: any, cell: cheerio.Element) => $(cell).text()).get();
    // Verify that the regions start with "us-east-1"
    const isValidRegion = regions.every((region: string) => region.startsWith('us-east-1'));
    expect(isValidRegion).toBe(true);
  });

});