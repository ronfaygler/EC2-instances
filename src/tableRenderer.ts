export function renderTable(instances: any[]): string {
    const tableHeaders = ['Name', 'ID', 'Type', 'State', 'Availability Zone', 'Public IP', 'Private IPs'];
  
    const tableRows = instances.map((instance) => {
      const { name, id, type, state, az, publicIp, privateIps } = instance;
  
      return `
        <tr>
          <td>${name}</td>
          <td>${id}</td>
          <td>${type}</td>
          <td>${state}</td>
          <td>${az}</td>
          <td>${publicIp}</td>
          <td>${privateIps}</td>
        </tr>
      `;
    });
  
    const tableHtml = `
      <table>
        <thead>
          <tr>
            ${tableHeaders.map((header) => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>
    `;
  
    // CSS styling for the table
    const tableStyle = `
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
      </style>
    `;
  
    return `${tableStyle}${tableHtml}`;
  }
  