import { ImageMetadata } from '../services/image-data.service';

export async function readXmpMetaData(imageFile: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const binaryString = new TextDecoder().decode(
        new Uint8Array(arrayBuffer)
      );

      const xmpStart = binaryString.indexOf('<x:xmpmeta');
      const xmpEnd = binaryString.indexOf('</x:xmpmeta>');

      if (xmpStart !== -1 && xmpEnd !== -1) {
        const extractedXmp = binaryString.substring(xmpStart, xmpEnd + 12);
        resolve(extractedXmp);
      } else {
        console.warn('No XMP metadata found.');
        resolve(null);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(imageFile);
  });
}

export async function writeXmpMetadata(
  file: File,
  metadata: ImageMetadata
): Promise<Blob> {
  const xmpXml = createXmpXml(metadata);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const encoder = new TextEncoder();

      const xmpPayload = encoder.encode(xmpXml);
      const xmpIdentifier = encoder.encode('http://ns.adobe.com/xap/1.0/\0');

      const xmpBinary = new Uint8Array(
        xmpIdentifier.length + xmpPayload.length
      );
      xmpBinary.set(xmpIdentifier, 0);
      xmpBinary.set(xmpPayload, xmpIdentifier.length);

      const xmpHeader = new Uint8Array(4);
      xmpHeader[0] = 0xff;
      xmpHeader[1] = 0xe1;
      const totalLength = xmpBinary.length + 2;
      xmpHeader[2] = (totalLength >> 8) & 0xff;
      xmpHeader[3] = totalLength & 0xff;

      const insertIndex = 2;

      const newImage = new Uint8Array(
        uint8Array.length + xmpHeader.length + xmpBinary.length
      );
      newImage.set(uint8Array.subarray(0, insertIndex), 0);
      newImage.set(xmpHeader, insertIndex);
      newImage.set(xmpBinary, insertIndex + xmpHeader.length);
      newImage.set(
        uint8Array.subarray(insertIndex),
        insertIndex + xmpHeader.length + xmpBinary.length
      );

      resolve(new Blob([newImage], { type: file.type }));
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function createXmpXml(md: ImageMetadata): string {
  const tags = (md.tags || [])
    .map((tag) => `<rdf:li>${escapeXml(tag)}</rdf:li>`)
    .join('');

  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXml(md.title)}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXml(md.description)}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${escapeXml(md.creator)}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <dc:subject>
        <rdf:Bag>
          ${tags}
        </rdf:Bag>
      </dc:subject>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
