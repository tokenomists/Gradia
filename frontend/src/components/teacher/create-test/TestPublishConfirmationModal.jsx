import React from 'react';
import { CircleAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const TestPublishConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  testTitle 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#d97056] text-xl font-semibold">
            Confirm Test Publication
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            You&apos;re about to publish the test: <span className="font-bold">{testTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <span className="mt-1 text-yellow-600">
                <CircleAlert className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-yellow-800 mb-1">Important Information</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>The test will become visible to students.</li>
                  <li>Only minor edits will be allowed after publishing.</li>
                  <li>The schedule (start/end time) will be locked</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#d97056] text-white hover:bg-[#c5634c]"
          >
            Confirm & Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
