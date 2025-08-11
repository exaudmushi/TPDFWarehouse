import { Printer, DownloadCloud } from 'lucide-react';
import { useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import DatePicker from './components/DatePicker';


const MonthlyReportPage = () => {
  const [selected, setSelected] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelected(date);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <h4 className="mb-3 mb-md-0">TPDF - Monthy Reports</h4>
        <div className="d-flex align-items-center flex-wrap text-nowrap">
          <span className="mx-3">From</span><DatePicker selected={selected} onDateSelect={handleDateSelect} className="w-200px me-2 mb-2 mb-md-0" />
          <span className="mx-3">To</span><DatePicker selected={selected} onDateSelect={handleDateSelect} className="w-200px me-2 mb-2 mb-md-0" />
          <Button variant="outline-primary" className="btn-icon-text me-2 mb-2 mb-md-0">
            <Printer size={16} className="me-2" />
            Print
          </Button>
          <Button variant="primary" className="btn-icon-text mb-2 mb-md-0">
            <DownloadCloud size={16} className="me-2" />
            Download Report
          </Button>
        </div>
      </div>
  
      <Row>

      </Row>
    </>
  );
};

export default MonthlyReportPage;
