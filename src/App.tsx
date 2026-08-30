/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCVStore } from './store';
import TemplateGallery from './components/TemplateGallery';
import Builder from './components/Builder';

export default function App() {
  const templateId = useCVStore(state => state.data.templateId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {!templateId ? <TemplateGallery /> : <Builder />}
    </div>
  );
}
