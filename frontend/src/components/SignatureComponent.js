import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureComponent = ({ signatureData, setSignatureData }) => {
  const sigCanvas = useRef(null);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignatureData('');
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setSignatureData(data);
    }
  };

  useEffect(() => {
    if (sigCanvas.current) {
      sigCanvas.current.off();
      sigCanvas.current.on();
    }
  }, []);

  return (
    <div className="signature-container">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
        onEnd={saveSignature}
      />
      <div>
        <button type="button" onClick={clearSignature}>Clear Signature</button>
      </div>
    </div>
  );
};

export default SignatureComponent;
