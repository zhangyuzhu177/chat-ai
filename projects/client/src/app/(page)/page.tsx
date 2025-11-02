'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function Home() {
  
  return (
    <div>
      <Dialog>
      <DialogTrigger >
        {/* <Button variant="outline">Edit Profile</Button> */}
        <div className="flex items-center gap-2">
          <div>设置</div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
          </DialogHeader>
          <div>
            123
          </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
