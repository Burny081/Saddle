import { describe, expect, it, vi } from 'vitest';
import jsPDF from 'jspdf';
import { addStandardFooterSync, addStandardHeaderSync } from './pdfGenerator';

const company = {
  name: 'SaddlePoint Service',
  slogan: 'Solutions électriques',
  address: 'Douala, Cameroun',
  phone: '+237 6 74 93 23 19',
  email: 'bongni@saddlepoint.org',
};

describe('standard PDF branding', () => {
  it('uses an embedded jsPDF font instead of the unavailable Ethnocentric font', () => {
    const doc = new jsPDF();
    const setFont = vi.spyOn(doc, 'setFont');

    addStandardHeaderSync(doc, 'quote', 'DEV-001', '26/10/2026', company);
    addStandardFooterSync(doc, 1, 1, company);

    expect(setFont).not.toHaveBeenCalledWith('Ethnocentric', 'normal');
    expect(setFont).toHaveBeenCalledWith('helvetica', 'bold');
  });
});
