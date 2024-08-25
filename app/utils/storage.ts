class Storage {
  private AUTH_TOKEN_NAME = "tid";
  private STEPS_DATA_NAME = "STEPS_DATA";

  async getAuthToken() {
    return new Promise((res) => {
      const token = localStorage.getItem(this.AUTH_TOKEN_NAME);
      res(token);
    })
  }

  async setAuthToken(token: string) {
    return new Promise((res) => {
      localStorage.setItem(this.AUTH_TOKEN_NAME, token);
      res({});
    })
  }

  getStepsData(activeStep: number) {
    const name = `${this.STEPS_DATA_NAME}-${activeStep}`;
    const prevDataString = localStorage.getItem(name);
    const data = JSON.parse(prevDataString || "{}");
    return data;
  }

  setStepsData(activeStep: number, data: Record<string, unknown>) {
    const name = `${this.STEPS_DATA_NAME}-${activeStep}`;
    const prevDataString = localStorage.getItem(name);
    const prevData = JSON.parse(prevDataString || "{}");
    localStorage.setItem(name, JSON.stringify({
      ...prevData,
      ...data
    }));
  }

  clearSteps(activeStep: number) {
    const name = `${this.STEPS_DATA_NAME}-${activeStep}`;
    localStorage.removeItem(name);
  }
}

export const storage = new Storage();
