import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Minus, Play, Pause, RotateCcw, Download, Upload, Camera, Wand2 } from 'lucide-react';

const LoomHookDesigner = () => {
  const [hooks, setHooks] = useState(16);
  const [picks, setPicks] = useState(12);
  const [hookPattern, setHookPattern] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('plain');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPick, setCurrentPick] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Predefined patterns
  const patterns = {
    plain: { name: 'Plain Weave', repeat: 2 },
    twill: { name: '2/2 Twill', repeat: 4 },
    satin: { name: 'Satin', repeat: 5 },
    basket: { name: 'Basket Weave', repeat: 4 },
    custom: { name: 'Custom Design', repeat: 1 }
  };

  // Generate hook pattern based on selected design
  const generatePattern = (patternType, numHooks, numPicks) => {
    const pattern = [];
    
    for (let pick = 0; pick < numPicks; pick++) {
      const row = [];
      for (let hook = 0; hook < numHooks; hook++) {
        let position = 0;
        
        switch(patternType) {
          case 'plain':
            position = (hook + pick) % 2 === 0 ? 1 : -1;
            break;
          case 'twill':
            position = ((hook + pick) % 4 < 2) ? 1 : -1;
            break;
          case 'satin':
            position = ((hook * 2 + pick) % 5 === 0) ? 1 : -1;
            break;
          case 'basket':
            position = (Math.floor(hook / 2) + Math.floor(pick / 2)) % 2 === 0 ? 1 : -1;
            break;
          default:
            position = 0;
        }
        row.push(position);
      }
      pattern.push(row);
    }
    return pattern;
  };

  useEffect(() => {
    if (!customMode && !uploadedImage) {
      const newPattern = generatePattern(selectedPattern, hooks, picks);
      setHookPattern(newPattern);
    } else if (customMode && hookPattern.length === 0) {
      const newPattern = Array(picks).fill(null).map(() => Array(hooks).fill(0));
      setHookPattern(newPattern);
    }
  }, [selectedPattern, hooks, picks, customMode, uploadedImage]);

  useEffect(() => {
    let interval;
    if (isPlaying && hookPattern.length > 0) {
      interval = setInterval(() => {
        setCurrentPick(prev => (prev + 1) % picks);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, picks, hookPattern]);

  // Image analysis function
  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: imageData
                  }
                },
                {
                  type: "text",
                  text: `Analyze this weave pattern image and provide a JSON response ONLY (no other text) with this structure:
{
  "patternType": "plain|twill|satin|basket|complex",
  "description": "brief description of the weave pattern",
  "repeatWidth": number (how many threads before pattern repeats horizontally),
  "repeatHeight": number (how many threads before pattern repeats vertically),
  "hookPattern": [[1,-1,1,-1], [array of arrays where 1=hook up/warp over, -1=hook down/warp under]],
  "confidence": "high|medium|low"
}

Analyze the fabric structure carefully. Look for:
- Over/under interlacing patterns
- Repeat units
- Diagonal lines (twill)
- Even distribution (plain)
- Long floats (satin)

Return ONLY the JSON, no markdown backticks or explanations.`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim();
      
      // Clean up the response - remove markdown backticks if present
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const result = JSON.parse(cleanText);
      
      setAnalysisResult(result);
      
      // Apply the analyzed pattern
      if (result.hookPattern && result.hookPattern.length > 0) {
        setHookPattern(result.hookPattern);
        setPicks(result.hookPattern.length);
        setHooks(result.hookPattern[0].length);
        setSelectedPattern('custom');
        setCustomMode(true);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        patternType: 'error',
        description: 'Failed to analyze image. Please try with a clearer fabric image.',
        confidence: 'low'
      });
    }
    
    setIsAnalyzing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas to resize image
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800px while maintaining aspect ratio
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        setUploadedImage(event.target.result);
        
        // Get base64 data
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Analyze the image
        await analyzeImage(base64Data);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const toggleHook = (pickIdx, hookIdx) => {
    if (!customMode) return;
    const newPattern = [...hookPattern];
    const current = newPattern[pickIdx][hookIdx];
    newPattern[pickIdx][hookIdx] = current === 1 ? -1 : current === -1 ? 0 : 1;
    setHookPattern(newPattern);
  };

  const resetPattern = () => {
    setCurrentPick(0);
    setIsPlaying(false);
    setUploadedImage(null);
    setAnalysisResult(null);
    if (customMode) {
      const newPattern = Array(picks).fill(null).map(() => Array(hooks).fill(0));
      setHookPattern(newPattern);
    }
  };

  const exportPattern = () => {
    const data = {
      hooks,
      picks,
      pattern: selectedPattern,
      hookPattern,
      analysis: analysisResult
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loom-pattern-${selectedPattern}-${Date.now()}.json`;
    a.click();
  };

  const getHookColor = (position) => {
    if (position === 1) return 'bg-blue-500';
    if (position === -1) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getHookIcon = (position) => {
    if (position === 1) return <ChevronUp className="w-4 h-4 text-white" />;
    if (position === -1) return <ChevronDown className="w-4 h-4 text-white" />;
    return <Minus className="w-4 h-4 text-white" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">LoomAI - Hook Chain Designer</h1>
        <p className="text-slate-600 mb-4">Design, analyze, and simulate elastic band tape machine hook patterns</p>
        
        {/* Image Upload Section */}
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">AI Pattern Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={isAnalyzing}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing...' : 'Upload Fabric Image'}
              </button>
              <p className="text-xs text-slate-600 mt-2">
                Upload a clear photo of fabric weave pattern for AI analysis
              </p>
            </div>
            
            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded fabric"
                  className="w-full h-32 object-cover rounded-lg border-2 border-purple-300"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white font-medium">Analyzing pattern...</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {analysisResult && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <h3 className="font-bold text-slate-800 mb-2">Analysis Result:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Pattern Type:</span> {analysisResult.patternType}</div>
                <div><span className="font-medium">Confidence:</span> {analysisResult.confidence}</div>
                {analysisResult.repeatWidth && (
                  <div><span className="font-medium">Repeat Width:</span> {analysisResult.repeatWidth}</div>
                )}
                {analysisResult.repeatHeight && (
                  <div><span className="font-medium">Repeat Height:</span> {analysisResult.repeatHeight}</div>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2">{analysisResult.description}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Hooks: {hooks}
            </label>
            <input
              type="range"
              min="4"
              max="32"
              value={hooks}
              onChange={(e) => setHooks(parseInt(e.target.value))}
              className="w-full"
              disabled={uploadedImage}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Picks: {picks}
            </label>
            <input
              type="range"
              min="4"
              max="24"
              value={picks}
              onChange={(e) => setPicks(parseInt(e.target.value))}
              className="w-full"
              disabled={uploadedImage}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Weave Pattern
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => {
                setSelectedPattern(e.target.value);
                setCustomMode(e.target.value === 'custom');
                setUploadedImage(null);
                setAnalysisResult(null);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(patterns).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetPattern}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={exportPattern}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <ChevronUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Hook Up (Warp raised)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Hook Down (Warp lowered)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
              <Minus className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Hook Middle (Neutral)</span>
          </div>
        </div>

        {customMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Custom Mode:</strong> Click on any hook position to cycle through Up → Down → Middle
            </p>
          </div>
        )}
      </div>

      {/* Hook Pattern Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Hook Chain Pattern</h2>
        
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium">
                  Pick #
                </th>
                {Array.from({ length: hooks }, (_, i) => (
                  <th key={i} className="border border-slate-300 bg-slate-100 px-2 py-2 text-xs font-medium">
                    H{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hookPattern.map((row, pickIdx) => (
                <tr key={pickIdx} className={pickIdx === currentPick ? 'bg-yellow-50' : ''}>
                  <td className={`border border-slate-300 px-3 py-2 text-sm font-medium ${pickIdx === currentPick ? 'bg-yellow-200' : 'bg-slate-50'}`}>
                    {pickIdx + 1}
                    {pickIdx === currentPick && (
                      <span className="ml-2 text-xs text-yellow-700">→</span>
                    )}
                  </td>
                  {row.map((position, hookIdx) => (
                    <td
                      key={hookIdx}
                      onClick={() => toggleHook(pickIdx, hookIdx)}
                      className={`border border-slate-300 p-1 ${customMode ? 'cursor-pointer hover:opacity-80' : ''}`}
                    >
                      <div className={`w-8 h-8 ${getHookColor(position)} rounded flex items-center justify-center transition-all ${pickIdx === currentPick ? 'scale-110 shadow-lg' : ''}`}>
                        {getHookIcon(position)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fabric Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Fabric Structure Preview</h2>
        <div className="inline-block">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${hooks}, 1fr)` }}>
            {hookPattern.map((row, pickIdx) => (
              row.map((position, hookIdx) => (
                <div
                  key={`${pickIdx}-${hookIdx}`}
                  className={`w-6 h-6 ${position === 1 ? 'bg-slate-700' : 'bg-slate-200'} border border-slate-300`}
                  title={`Pick ${pickIdx + 1}, Hook ${hookIdx + 1}: ${position === 1 ? 'Warp over weft' : 'Weft over warp'}`}
                />
              ))
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-4">
          Dark squares: Warp thread on top (hook up) | Light squares: Weft thread on top (hook down)
        </p>
      </div>
    </div>
  );
};

export default LoomHookDesigner;