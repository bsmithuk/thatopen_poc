export class PageNavigator {
    pages: NodeListOf<Element>;
  
    constructor() {
      // Get all elements with the class 'page'
      this.pages = document.querySelectorAll('.page');
    }
  
    navigateTo(id: string) {
      // Loop through all pages and toggle display based on the id
      for (const page of this.pages) {
        if (page.id === id) {
          (page as HTMLElement).style.display = "flex";
        } else {
          (page as HTMLElement).style.display = "none";
        }
      }
    }
  }