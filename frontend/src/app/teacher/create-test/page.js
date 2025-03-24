'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { isAuthenticated } from '@/utils/auth';

export default function CreateTest() {
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 30,
    testType: 'typed', // 'handwritten' or 'typed'
    classAssignment: '',
    passingScore: 70,
    isTimeLimited: true,
    questions: [],
    rubric: {
      title: '',
      description: '',
      criteria: []
    },
    files: []
  });

  const [activeTab, setActiveTab] = useState('details');
  const [classes, setClasses] = useState([
    { id: 1, name: 'CS101 - Introduction to Programming' },
    { id: 2, name: 'CS201 - Data Structures & Algorithms' },
    { id: 3, name: 'CS301 - Database Systems' }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const { isLoggedIn, role } = await isAuthenticated();
      if (!isLoggedIn) {
        localStorage.setItem("notification", JSON.stringify({ type: "error", message: "Login to access protected pages!" }));
        window.location.href = '/';
      } else if (role !== 'teacher') {
        localStorage.setItem("notification", JSON.stringify({ type: "error", message: "Students cannot access pages related to teacher!" }));
        window.location.href = '/';
      }
    };
  
    checkAuth();
  }, []);
  

  // Calculate duration when start and end times change
  useEffect(() => {
    if (testData.startTime && testData.endTime) {
      const start = new Date(testData.startTime);
      const end = new Date(testData.endTime);
      if (end > start) {
        const durationInMinutes = Math.round((end - start) / (1000 * 60));
        setTestData(prev => ({
          ...prev,
          duration: durationInMinutes
        }));
      }
    }
  }, [testData.startTime, testData.endTime]);

  // Handle test details changes
  const handleTestDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData({
      ...testData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Add a new question based on test type
  const addQuestion = () => {
    const newQuestion = testData.testType === 'typed' ? 
      {
        questionText: '',
        questionType: 'theoretical', // theoretical or coding
        codingLanguage: 'javascript',
        maxMarks: 10,
        enableRubrics: false,
        options: [],
        points: 10
      } : 
      {
        questionText: '',
        imageUrl: '',
        maxMarks: 10,
        enableRubrics: false,
        points: 10
      };

    setTestData({
      ...testData,
      questions: [...testData.questions, newQuestion]
    });
  };

  // Handle question field changes
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[index][field] = value;
    setTestData({
      ...testData,
      questions: updatedQuestions
    });
  };

  // Remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = testData.questions.filter((_, i) => i !== index);
    setTestData({
      ...testData,
      questions: updatedQuestions
    });
  };

  // Handle file uploads for handwritten tests
  const handleQuestionImageUpload = (questionIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedQuestions = [...testData.questions];
      updatedQuestions[questionIndex].imageUrl = URL.createObjectURL(file);
      setTestData({
        ...testData,
        questions: updatedQuestions
      });
    }
  };

  // Handle general file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setTestData({
      ...testData,
      files: [...testData.files, ...files]
    });
  };

  // Remove a file
  const removeFile = (index) => {
    const updatedFiles = testData.files.filter((_, i) => i !== index);
    setTestData({
      ...testData,
      files: updatedFiles
    });
  };

  // Add a rubric criterion
  const addRubricCriterion = () => {
    const newCriterion = {
      name: '',
      weight: 25,
      levels: [
        { label: 'Poor', score: 1, description: '' },
        { label: 'Fair', score: 2, description: '' },
        { label: 'Good', score: 3, description: '' },
        { label: 'Excellent', score: 4, description: '' }
      ]
    };

    setTestData({
      ...testData,
      rubric: {
        ...testData.rubric,
        criteria: [...testData.rubric.criteria, newCriterion]
      }
    });
  };

  // Update rubric criterion
  const updateRubricCriterion = (index, field, value) => {
    const updatedCriteria = [...testData.rubric.criteria];
    updatedCriteria[index][field] = value;
    
    setTestData({
      ...testData,
      rubric: {
        ...testData.rubric,
        criteria: updatedCriteria
      }
    });
  };

  // Update rubric level
  const updateRubricLevel = (criterionIndex, levelIndex, field, value) => {
    const updatedCriteria = [...testData.rubric.criteria];
    updatedCriteria[criterionIndex].levels[levelIndex][field] = value;
    
    setTestData({
      ...testData,
      rubric: {
        ...testData.rubric,
        criteria: updatedCriteria
      }
    });
  };

  // Handle rubric details change
  const handleRubricChange = (e) => {
    const { name, value } = e.target;
    setTestData({
      ...testData,
      rubric: {
        ...testData.rubric,
        [name]: value
      }
    });
  };

  // Form submission
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    try {
      // Here you would implement your API call to save the test
      console.log('Submitting test data:', { ...testData, isDraft });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show confirmation modal
      if (isDraft) {
        alert('Test saved as draft!');
      } else {
        confirm('Are you sure you want to publish this test?') && 
          alert('Test published successfully!');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f1]">
      {/* Header */}
      <header className="bg-[#d97056] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-3xl font-cursive">
            Gradia
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/practice" className="text-xl">
              Practice
            </Link>
            <Link href="/performance" className="text-xl">
              Performance
            </Link>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Test</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-[#f5eee0] rounded-xl p-6 shadow-md">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-300">
            <button
              className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-[#d97056] font-bold' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Test Details
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'questions' ? 'border-b-2 border-[#d97056] font-bold' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'rubrics' ? 'border-b-2 border-[#d97056] font-bold' : ''}`}
              onClick={() => setActiveTab('rubrics')}
            >
              Rubrics (Optional)
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'review' ? 'border-b-2 border-[#d97056] font-bold' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              Review & Finalize
            </button>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)}>
            {/* Step 1: Test Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Test Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={testData.title}
                    onChange={handleTestDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Midterm Examination"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={testData.description}
                    onChange={handleTestDetailsChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Provide test instructions and details"
                    rows="4"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">Start Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={testData.startTime}
                      onChange={handleTestDetailsChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">End Time <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={testData.endTime}
                      onChange={handleTestDetailsChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      value={testData.duration}
                      onChange={handleTestDetailsChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="1"
                      readOnly={testData.startTime && testData.endTime}
                      title={testData.startTime && testData.endTime ? "Duration is calculated from start and end times" : ""}
                    />
                    {testData.startTime && testData.endTime && (
                      <p className="text-sm text-gray-500 mt-1">Auto-calculated from start and end times</p>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <label className="block mb-1 font-medium">Class Assignment <span className="text-red-500">*</span></label>
                    <select
                      name="classAssignment"
                      value={testData.classAssignment}
                      onChange={handleTestDetailsChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-md bg-white">
                  <label className="block mb-3 font-medium">Test Type <span className="text-red-500">*</span></label>
                  <div className="flex space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="testType"
                        value="handwritten"
                        checked={testData.testType === 'handwritten'}
                        onChange={handleTestDetailsChange}
                        className="mr-2"
                      />
                      <span>Handwritten (OCR)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="testType"
                        value="typed"
                        checked={testData.testType === 'typed'}
                        onChange={handleTestDetailsChange}
                        className="mr-2"
                      />
                      <span>Typed</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isTimeLimited"
                      checked={testData.isTimeLimited}
                      onChange={handleTestDetailsChange}
                      className="mr-2"
                    />
                    <span>Enable time limit</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Questions Tab */}
            {activeTab === 'questions' && (
  <div className="space-y-8">
    {testData.questions.length === 0 && (
      <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No questions added yet. Click the button below to add your first question.</p>
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 bg-[#d97056] text-white rounded-md hover:bg-[#c5634c] transition"
        >
          + Add First Question
        </button>
      </div>
    )}
    
    {testData.questions.map((question, questionIndex) => (
      <div key={questionIndex} className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
          <button
            type="button"
            onClick={() => removeQuestion(questionIndex)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>

        {/* Common fields for all question types */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Question Text <span className="text-red-500">*</span></label>
          <textarea
            value={question.questionText}
            onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
            required
          />
        </div>

        {/* Question Type Selection - Updated to have 3 options */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Question Type <span className="text-red-500">*</span></label>
          <select
            value={question.questionType}
            onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="theoretical">Theoretical (Rich Text Editor)</option>
            <option value="coding">Coding (Code Editor)</option>
            <option value="handwritten">Handwritten (OCR)</option>
          </select>

          {/* Coding-specific options */}
          {question.questionType === 'coding' && (
            <div className="mt-3">
              <label className="block mb-1 font-medium">Programming Language</label>
              <select
                value={question.codingLanguage || 'javascript'}
                onChange={(e) => handleQuestionChange(questionIndex, 'codingLanguage', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-1/2">
            <label className="block mb-1 font-medium">Max Marks <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={question.maxMarks}
              onChange={(e) => handleQuestionChange(questionIndex, 'maxMarks', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
              required
            />
          </div>
          <div className="w-full sm:w-1/2 flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={question.enableRubrics}
                onChange={(e) => handleQuestionChange(questionIndex, 'enableRubrics', e.target.checked)}
                className="mr-2"
              />
              <span>Enable Rubrics for this question</span>
            </label>
          </div>
        </div>
      </div>
    ))}

    {testData.questions.length > 0 && (
      <button
        type="button"
        onClick={addQuestion}
        className="px-4 py-2 bg-[#d97056] text-white rounded-md hover:bg-[#c5634c] transition"
      >
        + Add Question
      </button>
    )}
  </div>
)}

            {/* Rubrics Tab */}
            {activeTab === 'rubrics' && (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <p className="text-gray-600 italic">Rubrics are optional and helpful for evaluating questions consistently.</p>
    </div>
    
    <div>
      <label className="block mb-1 font-medium">Rubric Title</label>
      <input
        type="text"
        name="title"
        value={testData.rubric.title}
        onChange={handleRubricChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="e.g., Essay Evaluation Criteria"
      />
    </div>
    
    <div>
      <label className="block mb-1 font-medium">Rubric Description</label>
      <textarea
        name="description"
        value={testData.rubric.description}
        onChange={handleRubricChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Describe how answers should be evaluated"
        rows="3"
      />
    </div>
    
    <div className="bg-white p-4 rounded-lg">
      <h3 className="font-medium mb-4">Criteria</h3>
      
      {testData.rubric.criteria.length === 0 ? (
        <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 mb-2">No criteria added yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {testData.rubric.criteria.map((criterion, criterionIndex) => (
            <div key={criterionIndex} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Criterion {criterionIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedCriteria = testData.rubric.criteria.filter((_, idx) => idx !== criterionIndex);
                    setTestData({
                      ...testData,
                      rubric: {
                        ...testData.rubric,
                        criteria: updatedCriteria
                      }
                    });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove Criterion
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
                <div className="w-full sm:w-3/4">
                  <label className="block mb-1 text-sm font-medium">Criterion Name</label>
                  <input 
                    type="text" 
                    value={criterion.name}
                    onChange={(e) => updateRubricCriterion(criterionIndex, 'name', e.target.value)}
                    placeholder="e.g., Content Quality" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-full sm:w-1/4">
                  <label className="block mb-1 text-sm font-medium">Weight (%)</label>
                  <input 
                    type="number" 
                    value={criterion.weight}
                    onChange={(e) => updateRubricCriterion(criterionIndex, 'weight', parseInt(e.target.value, 10) || 0)}
                    placeholder="25%" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    max="100" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {criterion.levels.map((level, levelIndex) => (
                  <div key={levelIndex} className="border border-gray-200 rounded p-2">
                    <div className="font-medium text-center mb-1">{level.label} ({level.score})</div>
                    <textarea
                      value={level.description}
                      onChange={(e) => updateRubricLevel(criterionIndex, levelIndex, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm h-24"
                      placeholder={`Description for ${level.label} level...`}
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        type="button"
        onClick={addRubricCriterion}
        className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        + Add Criterion
      </button>
    </div>
  </div>
)}

            {/* Review & Finalize Tab */}
            {activeTab === 'review' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Test Summary</h2>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-[#d97056]">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Title:</p>
                      <p className="font-medium">{testData.title || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Test Type:</p>
                      <p className="font-medium capitalize">{testData.testType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Time:</p>
                      <p className="font-medium">{testData.startTime ? new Date(testData.startTime).toLocaleString() : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Time:</p>
                      <p className="font-medium">{testData.endTime ? new Date(testData.endTime).toLocaleString() : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration:</p>
                      <p className="font-medium">{testData.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class:</p>
                      <p className="font-medium">
                        {testData.classAssignment ? 
                          classes.find(c => c.id.toString() === testData.classAssignment.toString())?.name || "Unknown class" 
                          : "Not assigned"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Description:</p>
                      <p>{testData.description || "No description provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-[#d97056]">Questions Summary</h3>
                  {testData.questions.length === 0 ? (
                    <p className="text-gray-500 italic">No questions added yet</p>
                  ) : (
                    <div>
                      <p className="mb-2">Total Questions: <span className="font-medium">{testData.questions.length}</span></p>
                      <ul className="list-disc pl-5 space-y-1">
                        {testData.questions.map((q, i) => (
                          <li key={i}>
                            <span className="font-medium">Q{i+1}:</span> {q.questionText.substring(0, 60)}{q.questionText.length > 60 ? '...' : ''} 
                            <span className="text-gray-500 ml-1">({q.maxMarks} marks)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-[#d97056]">Rubrics Summary</h3>
                  {!testData.rubric.title && testData.rubric.criteria.length === 0 ? (
                    <p className="text-gray-500 italic">No rubrics defined</p>
                  ) : (
                    <div>
                      <p className="mb-1"><span className="font-medium">Title:</span> {testData.rubric.title || "Untitled"}</p>
                      <p className="mb-2"><span className="font-medium">Criteria Count:</span> {testData.rubric.criteria.length}</p>
                      {testData.rubric.criteria.length > 0 && (
                        <ul className="list-disc pl-5">
                          {testData.rubric.criteria.map((c, i) => (
                            <li key={i}>{c.name || `Criterion ${i+1}`} ({c.weight}%)</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-[#d97056]">Attached Files</h3>
                  {testData.files.length === 0 ? (
                    <p className="text-gray-500 italic">No files attached</p>
                  ) : (
                    <ul className="list-disc pl-5">
                      {testData.files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
                  <h3 className="font-medium mb-2">Important Notes</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Once published, you can make limited edits to the test</li>
                    <li>Students will be able to see this test once published</li>
                    <li>Make sure all required fields are filled before publishing</li>
                    <li>Test cannot be deleted after students have started taking it</li>
                  </ul>
                </div>
                
                {/* File upload area */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-[#d97056]">Attach Files (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-2">Upload any supplementary files for students</p>
                  
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    multiple
                  />
                  
                  {testData.files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Attached Files:</h4>
                      <ul className="space-y-2">
                        {testData.files.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Validation warnings */}
                {(!testData.title || !testData.startTime || !testData.endTime || !testData.classAssignment || testData.questions.length === 0) && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Please complete the following before publishing:</strong>
                        </p>
                        <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                          {!testData.title && <li>Add a test title</li>}
                          {!testData.startTime && <li>Set a start time</li>}
                          {!testData.endTime && <li>Set an end time</li>}
                          {!testData.classAssignment && <li>Assign to a class</li>}
                          {testData.questions.length === 0 && <li>Add at least one question</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              {activeTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabOrder = ['details', 'questions', 'rubrics', 'review'];
                    const currentIndex = tabOrder.indexOf(activeTab);
                    setActiveTab(tabOrder[currentIndex - 1]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto flex space-x-3">
                {activeTab !== 'review' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabOrder = ['details', 'questions', 'rubrics', 'review'];
                      const currentIndex = tabOrder.indexOf(activeTab);
                      setActiveTab(tabOrder[currentIndex + 1]);
                    }}
                    className="px-4 py-2 bg-[#d97056] text-white rounded-md hover:bg-[#c5634c] transition"
                  >
                    Next
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !testData.title || 
                        !testData.startTime || 
                        !testData.endTime || 
                        !testData.classAssignment || 
                        testData.questions.length === 0
                      }
                      className={`px-4 py-2 rounded-md transition ${
                        !testData.title || 
                        !testData.startTime || 
                        !testData.endTime || 
                        !testData.classAssignment || 
                        testData.questions.length === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      Publish Test
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5eee0] py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} Gradia - Intelligent Grading System</p>
          <div className="mt-4 flex justify-center space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-[#d97056]">About</Link>
            <Link href="/help" className="text-gray-600 hover:text-[#d97056]">Help Center</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-[#d97056]">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-[#d97056]">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal (can be implemented) */}
      {/* 
      Add a modal component here for confirmation before publishing.
      Example implementation would use a state variable to control visibility.
      */}
    </div>
  );
}