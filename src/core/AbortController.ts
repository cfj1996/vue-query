class AbortSignal {
  aborted: boolean = false;
   _listeners: any[] = []
   constructor() {
     this.aborted = false
     this._listeners = []
   }

   addEventListener(event:any, listener: any) {
     if (event === 'abort') {
       this._listeners.push(listener)
     }
   }

   _dispatchEvent() {
     this.aborted = true
     this._listeners.forEach(listener => listener())
   }
}

class AbortController {
  signal: AbortSignal;
  constructor() {
    this.signal = new AbortSignal()
  }

  abort() {
    if (!this.signal.aborted) {
      this.signal._dispatchEvent()
    }
  }
}

export default AbortController
