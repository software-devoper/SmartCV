import re

with open('src/components/Builder.tsx', 'r') as f:
    content = f.read()

header_start = content.find('<header')
header_end = content.find('</header>') + len('</header>')

new_header = """      <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white border-b border-slate-200/80 shadow-xs z-30 shrink-0">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs shadow-blue-500/20 text-white font-bold text-lg sm:text-xl shrink-0">
            <span>S</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">SmartCV</span>
              
              {/* Desktop Mode Pill */}
              <button 
                onClick={() => setIsTemplateModalOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all shadow-2xs border ${
                  isStudent 
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
                title="Click to switch template mode"
              >
                {isStudent ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Mode</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Pro Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Mode subtle text (under wordmark) */}
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className={`sm:hidden flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isStudent ? 'text-purple-600' : 'text-blue-600'
              }`}
            >
              {isStudent ? (
                <><GraduationCap className="w-3 h-3" /><span>Student</span></>
              ) : (
                <><Briefcase className="w-3 h-3" /><span>Pro</span></>
              )}
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
          
          {/* Progress Pill (Desktop) */}
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-extrabold text-blue-600">{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-36 sm:w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Segmented Control (Icons only on very small screens, text on tablet) */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex items-center justify-center gap-1.5 h-9 min-w-[2.75rem] px-2 sm:px-3 rounded-lg text-xs font-bold transition-all ${
                mobileTab === 'edit' 
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Edit"
            >
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 h-9 min-w-[2.75rem] px-2 sm:px-3 rounded-lg text-xs font-bold transition-all ${
                mobileTab === 'preview' 
                  ? 'bg-white text-blue-600 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Export Button */}
          <button 
            type="button"
            onClick={handleExport}
            disabled={isExporting} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-9 sm:h-10 px-3 sm:px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Export PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </header>"""

if header_start != -1 and header_end != -1:
    content = content[:header_start] + new_header + content[header_end:]
    with open('src/components/Builder.tsx', 'w') as f:
        f.write(content)
    print("Header replaced successfully!")
else:
    print("Header tags not found.")
