import React from 'react';

export default function AcademicInfo({ formData, setFormData }) {
  const handleChange = (e, section, field, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        academic: {
          ...prev.academic,
          [section]: prev.academic[section].map((item, i) =>
            i === index ? { ...item, [name]: value } : item
          )
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        academic: {
          ...prev.academic,
          [section]: {
            ...prev.academic[section],
            [name]: value
          }
        }
      }));
    }
  };

  const addAchievement = (section) => {
    setFormData(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        [section]: [...prev.academic[section], { event: '', date: '', outcome: '' }]
      }
    }));
  };

  const removeAchievement = (index, section) => {
    setFormData(prev => {
      const updated = [...prev.academic[section]];
      updated.splice(index, 1);
      return {
        ...prev,
        academic: {
          ...prev.academic,
          [section]: updated
        }
      };
    });
  };

  const renderInput = (label, name, section, type = 'text', required = false) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-blue-700/90">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData.academic[section][name] || ''}
        onChange={(e) => handleChange(e, section)}
        className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
        required={required}
      />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Class X */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
          <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800/90">Class X Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput('Institute', 'institute', 'classX', 'text', true)}
          {renderInput('Year', 'year', 'classX', 'text', true)}
          {renderInput('Board', 'board', 'classX', 'text', true)}
          {renderInput('PCM %', 'pcm', 'classX')}
          {renderInput('Aggregate %', 'aggregate', 'classX', 'text', true)}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-blue-800">Have you done Diploma/Polytechnic?<span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-2">
              {['Yes', 'No'].map(option => (
                <label key={option} className="inline-flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="isDiplomaOrPolytechnic"
                      value={option}
                      checked={formData.academic.classX.isDiplomaOrPolytechnic === option}
                      onChange={(e) => handleChange(e, 'classX')}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                      <div className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${formData.academic.classX.isDiplomaOrPolytechnic === option ? 'scale-100' : ''}`}></div>
                    </div>
                  </div>
                  <span className="ml-3 text-blue-800/90">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class XII */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
          <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800/90">Class XII Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput('Institute', 'institute', 'classXII', 'text', true)}
          {renderInput('Year', 'year', 'classXII', 'text', true)}
          {renderInput('Board', 'board', 'classXII', 'text', true)}
          {renderInput('PCM %', 'pcm', 'classXII')}
          {renderInput('Aggregate %', 'aggregate', 'classXII', 'text', true)}
        </div>
      </div>

      {/* Other Qualification */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
          <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800/90">Other Qualification</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput('Institute', 'institute', 'otherQualification')}
          {renderInput('Year', 'year', 'otherQualification')}
          {renderInput('Board', 'board', 'otherQualification')}
          {renderInput('PCM %', 'pcm', 'otherQualification')}
          {renderInput('Aggregate %', 'aggregate', 'otherQualification')}
        </div>
      </div>

      {/* Academic Achievements */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
          <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800/90">Academic Achievements</h2>
        </div>
        {formData.academic.academicAchievements.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Event</label>
              <input
                type="text"
                name="event"
                placeholder="Event name"
                value={item.event}
                onChange={(e) => handleChange(e, 'academicAchievements', 'event', index)}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Date</label>
              <input
                type="date"
                name="date"
                value={item.date}
                onChange={(e) => handleChange(e, 'academicAchievements', 'date', index)}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Outcome</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="outcome"
                  placeholder="Achievement"
                  value={item.outcome}
                  onChange={(e) => handleChange(e, 'academicAchievements', 'outcome', index)}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(index, 'academicAchievements')}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addAchievement('academicAchievements')}
          className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors duration-300 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Academic Achievement
        </button>
      </div>

      {/* Co-Curricular Achievements */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
          <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-800/90">Co-Curricular Achievements</h2>
        </div>
        {formData.academic.coCurricularAchievements.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Event</label>
              <input
                type="text"
                name="event"
                placeholder="Event name"
                value={item.event}
                onChange={(e) => handleChange(e, 'coCurricularAchievements', 'event', index)}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Date</label>
              <input
                type="date"
                name="date"
                value={item.date}
                onChange={(e) => handleChange(e, 'coCurricularAchievements', 'date', index)}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">Outcome</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="outcome"
                  placeholder="Achievement"
                  value={item.outcome}
                  onChange={(e) => handleChange(e, 'coCurricularAchievements', 'outcome', index)}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
                <button
                  type="button"
                  onClick={() => removeAchievement(index, 'coCurricularAchievements')}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addAchievement('coCurricularAchievements')}
          className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors duration-300 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Co-Curricular Achievement
        </button>
      </div>
    </div>
  );
}