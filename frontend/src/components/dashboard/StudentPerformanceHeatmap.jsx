import React from 'react';

const StudentPerformanceHeatmap = ({ data }) => {
  // console.log(data);
  // Function to determine cell color based on score
  const getCellColor = (score) => {
    if (score === null || score === undefined) return "bg-gray-200"; // NA cells
    if (score < 50) return "bg-red-500";
    if (score < 75) return "bg-orange-400";
    return "bg-green-500";
  };

  return (
    <div className="bg-stone-100 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Student Performance</h2>
      
      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${data.tests.length}, 1fr)` }}>
        {/* Header row with test names */}
        <div></div> {/* Empty cell for alignment */}
        {data.tests.map((test, index) => (
          <div key={`test-${index}`} className="text-center font-medium py-2">
            {test}
          </div>
        ))}
        
        {/* Subject rows with scores */}
        {data.subjects.map((subject, subjectIndex) => (
          <React.Fragment key={`subject-${subjectIndex}`}>
            <div className="py-4 font-medium">{subject}</div>
            {data.scores[subjectIndex].map((score, scoreIndex) => (
              <div 
                key={`score-${subjectIndex}-${scoreIndex}`} 
                className={`m-1 rounded-md flex items-center justify-center border border-black p-6 ${getCellColor(score)}`}
              >
                {score !== null ? `${score}%` : "NA"}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button className="bg-orange-400 text-white px-4 py-2 rounded-md">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

export default StudentPerformanceHeatmap;
