import { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const DataWarehouse = () => {
  const [step, setStep] = useState<number>(1);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'warning' | 'danger'>('warning');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<any>(null);

  // Auto-polling for task status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2) {
      interval = setInterval(fetchTaskStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [step]);

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
      const _req = localStorage.getItem('a_token');
      const res = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Authorization': `Basic ${_req}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res || !res.data.task_id) throw new Error('Upload failed');

      localStorage.setItem('task_id', res.data.task_id);
      setAlertVariant('success');
      setAlertMessage('✅ File uploaded successfully!');
      setStep(2);
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
      const _req = localStorage.getItem('a_token');
      const taskId = localStorage.getItem('task_id');
      const response = await fetch(`http://localhost:8000/api/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${_req}`,
        },
      });

      if (!response.ok) throw new Error('Status check failed');

      const result = await response.json();
      setTaskStatus(result.status);
      setTaskResult(result.data);

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

  const handleReset = () => {
    setStep(1);
    setZipFile(null);
    setTaskStatus(null);
    setTaskResult(null);
    setAlertMessage(null);
    localStorage.removeItem('task_id');
  };

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
            {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
            Upload
          </Button>
        </Form>
      )}

      {step === 2 && (
        <>
          <p>Checking task status...</p>
          <Button variant="info" onClick={fetchTaskStatus} disabled={isLoading}>
            {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
            Refresh Status
          </Button>

          {taskStatus && (
            <div className="mt-3">
              <p>Current Status: <strong>{taskStatus}</strong></p>
              {taskResult?.current_file && (
                <p>Processing File: <strong>{taskResult.current_file}</strong></p>
              )}
              {taskResult?.current_table && (
                <p>Processing Table: <strong>{taskResult.current_table}</strong></p>
              )}
              {taskResult?.progress?.percent && (
                <ProgressBar
                  now={taskResult.progress.percent}
                  label={`${taskResult.progress.percent}%`}
                  className="mt-2"
                />
              )}
              {taskResult?.errors?.length > 0 && (
                <div className="mt-3">
                  <h6>⚠️ Errors</h6>
                  <ul>
                    {taskResult.errors.map((err: any, idx: number) => (
                      <li key={idx}>
                        <strong>{err.file}</strong>: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
          <Button variant="secondary" onClick={handleReset} className="mt-3">
            Start Over
          </Button>
        </>
      )}
    </>
  );
};

export default DataWarehouse;
