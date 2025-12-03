import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import "../Common/Common.css";

const DateRangePicker = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState(new Date());

  const handleApply = () => {
    onDateChange({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });
  };

  return (
    <div className="date-range-picker">
      <Calendar size={20} color="#9ca3af" />

      <div className="date-picker-inputs">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="MMM d, yyyy"
          customInput={<input className="date-picker-input" />}
        />

        <span className="date-range-separator">to</span>

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="MMM d, yyyy"
          customInput={<input className="date-picker-input" />}
        />

        <button onClick={handleApply} className="date-picker-apply-btn">
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
