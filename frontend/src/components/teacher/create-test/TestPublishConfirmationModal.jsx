import React from 'react';
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
          <DialogTitle className="text-[#d97056] text-xl">Confirm Test Publication</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            You are about to publish the test: <span className="font-bold">{testTitle}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-sm text-yellow-700">
              Once published:
              <ul className="list-disc list-inside mt-1">
                <li>Students will be able to see this test</li>
                <li>You can make limited edits</li>
                <li>Test scheduling cannot be changed</li>
              </ul>
            </p>
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
            Confirm Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};