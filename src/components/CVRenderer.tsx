import React, { useRef, useState, useLayoutEffect } from 'react';

interface CVRendererProps {
  TemplateComponent: React.ComponentType<any>;
  data: any;
}

const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_MM = 210;

// Conversion at 96 DPI: 1mm = 3.779527px
// For simplicity, we can use CSS sizes directly, but we need numeric values to measure
const MM_TO_PX = 3.779527;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX; // ~1122.5px
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX; // ~793.7px

export default function CVRenderer({ TemplateComponent, data }: CVRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Reset styles for fresh measurement
    const el = containerRef.current;
    
    // Clear any previous pagination spacers
    const spacers = el.querySelectorAll('.pagination-spacer');
    spacers.forEach(s => s.remove());

    // Measure at scale 1.0
    el.style.width = `${PAGE_WIDTH_MM}mm`;
    el.style.transform = `scale(1)`;
    el.style.transformOrigin = 'top left';

    let bestScale = 1.0;
    let actualHeight = el.scrollHeight;

    // Try to auto-fit by shrinking down to 0.9
    if (actualHeight > PAGE_HEIGHT_PX) {
      for (let s = 0.95; s >= 0.90; s -= 0.05) {
        el.style.width = `${PAGE_WIDTH_MM / s}mm`;
        // Force reflow
        void el.offsetHeight;
        actualHeight = el.scrollHeight;
        
        if (actualHeight * s <= PAGE_HEIGHT_PX) {
          bestScale = s;
          break;
        }
      }
      
      // If none fit perfectly, we settle for 0.9 and paginate
      if (bestScale === 1.0) {
        bestScale = 0.9;
        el.style.width = `${PAGE_WIDTH_MM / 0.9}mm`;
        void el.offsetHeight;
      }
    }

    setScale(bestScale);

    // Now handle pagination
    // The virtual page height is PAGE_HEIGHT_PX / bestScale
    const virtualPageHeight = PAGE_HEIGHT_PX / bestScale;
    let currentPages = Math.ceil(el.scrollHeight / virtualPageHeight);

    if (currentPages > 1) {
      // We need to insert spacers to push overflowing elements to the next page
      // We will look for <section> tags.
      const sections = Array.from(el.querySelectorAll('section')) as HTMLElement[];
      
      let pageBoundary = virtualPageHeight;
      let addedSpacers = false;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        
        // Relative to the scaled container
        const offsetTop = (rect.top - containerRect.top) / bestScale;
        const offsetHeight = rect.height / bestScale;

        // If this section starts before the boundary but ends after it
        if (offsetTop < pageBoundary && (offsetTop + offsetHeight) > pageBoundary) {
          // It crosses the page boundary!
          
          // If the section is very tall (e.g. > 50% of page), we should try to break its children instead
          if (offsetHeight > virtualPageHeight * 0.4) {
            // Find children that cross
            const children = Array.from((section as HTMLElement).children) as HTMLElement[];
            // Skip the header (h2)
            const items = children.slice(1);
            
            for (let j = 0; j < items.length; j++) {
              const item = items[j];
              const itemRect = item.getBoundingClientRect();
              const itemTop = (itemRect.top - containerRect.top) / bestScale;
              const itemHeight = itemRect.height / bestScale;
              
              if (itemTop < pageBoundary && (itemTop + itemHeight) > pageBoundary) {
                // Push this specific item to the next page
                const spacerHeight = pageBoundary - itemTop;
                const spacer = document.createElement('div');
                spacer.className = 'pagination-spacer';
                spacer.style.height = `${spacerHeight}px`;
                
                // Insert before the item
                item.parentNode?.insertBefore(spacer, item);
                addedSpacers = true;
                
                // Update boundary for next items
                pageBoundary += virtualPageHeight;
                break; // Move to next boundary
              }
            }
          } else {
            // Push the whole section
            const spacerHeight = pageBoundary - offsetTop;
            const spacer = document.createElement('div');
            spacer.className = 'pagination-spacer';
            spacer.style.height = `${spacerHeight}px`;
            
            section.parentNode?.insertBefore(spacer, section);
            addedSpacers = true;
            
            pageBoundary += virtualPageHeight;
          }
        }
      }

      // Re-measure after adding spacers
      currentPages = Math.ceil(el.scrollHeight / virtualPageHeight);
    }

    setPages(currentPages);
    
    // Apply final styles
    el.style.transform = `scale(${bestScale})`;
    
    // Update container height to match scaled height so outer div scrolls correctly
    el.parentElement!.style.height = `${el.scrollHeight * bestScale}px`;

  }, [data, TemplateComponent]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        id="cv-renderer-root"
        className="origin-top-left bg-white"
        style={{
          minHeight: `${PAGE_HEIGHT_MM}mm`
        }}
      >
        <TemplateComponent data={data} />
      </div>
      
      {/* Visual Page Dividers for Preview */}
      {pages > 1 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-10">
          {Array.from({ length: pages - 1 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 opacity-50 flex items-center justify-center"
              style={{ top: `${(i + 1) * PAGE_HEIGHT_PX}px` }}
            >
              <span className="bg-red-400 text-white text-[10px] px-2 py-0.5 rounded-full -mt-2">Page Break</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
