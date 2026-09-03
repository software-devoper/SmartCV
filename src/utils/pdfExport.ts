import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Robust Client-Side PDF Exporter
 * Handles responsive scaling, transform resetting, and high-DPI rendering.
 */
export async function exportToPDF(
  elementId: string,
  filename: string = 'My_Resume_CV.pdf'
): Promise<boolean> {
  // Try to find the target element by provided ID or common fallback IDs
  let element: HTMLElement | null = document.getElementById(elementId);
  if (!element) {
    element = document.getElementById('cv-renderer-root')
      || document.getElementById('cv-export-container')
      || document.getElementById('cv-template-root')
      || (document.querySelector('[id^="cv-"]') as HTMLElement | null);
  }

  if (!element) {
    console.error('PDF Export: Target resume element not found in DOM', elementId);
    alert('Could not find the resume preview canvas to export. Please ensure the preview is visible.');
    return false;
  }

  // Find parent container with zoom/scale transform if any
  const parentContainer = element.closest('#cv-export-container') as HTMLElement | null || element;
  const originalTransform = parentContainer.style.transform;
  const originalTransition = parentContainer.style.transition;

  // Temporarily reset CSS transform for 1:1 pixel-perfect capture
  parentContainer.style.transform = 'none';
  parentContainer.style.transition = 'none';

  // Force reflow
  void parentContainer.offsetHeight;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High-definition 2x capture
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    // Restore original transform immediately
    parentContainer.style.transform = originalTransform;
    parentContainer.style.transition = originalTransition;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in pt (595.28 x 841.89)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;

    const totalPdfHeight = imgHeight * ratio;

    let heightLeft = totalPdfHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Subsequent pages if multiple pages
    while (heightLeft > 0) {
      position = heightLeft - totalPdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Ensure filename ends with .pdf
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);
    return true;
  } catch (error) {
    console.error('PDF Export failed:', error);
    parentContainer.style.transform = originalTransform;
    parentContainer.style.transition = originalTransition;
    alert('An error occurred while generating your PDF. Please try again.');
    return false;
  }
}
