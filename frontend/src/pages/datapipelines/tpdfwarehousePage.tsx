import { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';

const DataWarehouse = () => {
  const [step, setStep] = useState<number>(1);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'warning' | 'danger'>('warning');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setZipFile(e.target.files[0]);
      setAlertMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!zipFile) {
      setAlertVariant('warning');
      setAlertMessage('⚠️ Please select a ZIP file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', zipFile);

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer `
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      await response.json();
      setAlertVariant('success');
      setAlertMessage('✅ File uploaded successfully!');
      setStep(2); // Move to next step
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('❌ Upload failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskStatus = async () => {
    setIsLoading(true);
    try {
      const tk = localStorage.getItem('_@') 
      const response = await fetch('http://localhost:8000/api/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tk}`
        },
      });

      if (!response.ok) throw new Error('Status check failed');

      const result = await response.json();
      setTaskStatus(result.status);
      setTaskResult(result.data); // Could be list of converted files, etc.

      if (result.status === 'completed') {
        setStep(3);
      }
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('❌ Failed to fetch task status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  fetch('/api/access')
    .then(res => res.json())
    .then(data => {
      // Assume data.statusMessages is an array of strings
      localStorage.setItem('_@',data.token.access_token)
      //setAlertMessage(combinedMessage);
      //setAlertVariant('success'); // or 'success', 'warning', etc.
    })
    .catch((err:any) => {
      setAlertMessage( `Error message: ${err}.`);
      setAlertVariant('danger');
    });
}, []);

  return (
    <>

      <div className="mb-4">
        <h4>TPDF - Warehouse</h4>
        <ProgressBar className="mt-3" now={step * 33.3} label={`Step ${step}`} />
      </div>

      {alertMessage && (
        <Alert variant={alertVariant} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      {step === 1 && (
        <Form>
          <Form.Group controlId="formFile">
            <Form.Label>Upload ZIP File</Form.Label>
            <Form.Control type="file" accept=".zip" onChange={handleFileChange} />
          </Form.Group>
          <Button variant="primary" onClick={handleUpload} disabled={isLoading} className="mt-3">
            {isLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Upload
          </Button>
        </Form>
      )}

      {step === 2 && (
        <>
          <p>Checking task status...</p>
          <Button variant="info" onClick={fetchTaskStatus} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Refresh Status
          </Button>
          {taskStatus && <p className="mt-3">Current Status: <strong>{taskStatus}</strong></p>}
        </>
      )}

      {step === 3 && (
        <>
          <h5>✅ Task Completed</h5>
          <p>Converted files:</p>
          <ul>
            {taskResult?.convertedFiles?.map((file: string, idx: number) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default DataWarehouse;
