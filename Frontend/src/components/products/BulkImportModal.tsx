import { useState, useRef } from "react";
import { Upload, X, FileText, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { productApi } from "@/lib/productApi";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    total?: number;
    success?: number;
    failed?: number;
    errors?: { row: number; sku: string; error: string }[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await productApi.downloadBulkTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bulk_products_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download template", error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);
    try {
      const data = await productApi.uploadBulkProducts(file);
      setResult(data);
      if (data.success && data.success > 0) {
        onSuccess();
      }
    } catch (error: any) {
      setResult({
        errors: [{ row: 0, sku: "Unknown", error: error.response?.data?.error || "Upload failed" }]
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file to add or update multiple products at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm">
                  <p className="font-medium">Need the correct format?</p>
                  <p className="text-muted-foreground">Download the template first.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <X className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-muted rounded-full">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Click or drag file to upload</p>
                    <p className="text-xs text-muted-foreground">XLSX or CSV up to 10MB</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold">{result.total || 0}</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                  <p className="text-xs text-green-600 mb-1">Success</p>
                  <p className="text-2xl font-bold text-green-600">{result.success || 0}</p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg text-center border border-destructive/20">
                  <p className="text-xs text-destructive mb-1">Failed</p>
                  <p className="text-2xl font-bold text-destructive">{result.failed || 0}</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  <div className="bg-destructive/10 px-4 py-2 flex items-center gap-2 border-b">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Errors</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">Row</th>
                          <th className="text-left px-4 py-2 font-medium">SKU</th>
                          <th className="text-left px-4 py-2 font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((err, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-2 whitespace-nowrap">{err.row}</td>
                            <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{err.sku}</td>
                            <td className="px-4 py-2 text-destructive">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? "Uploading..." : "Import File"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
