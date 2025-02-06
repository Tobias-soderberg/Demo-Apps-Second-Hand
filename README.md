# Python API Test & React Application

## Description

This repository contains multiple projects:

- **Python API Test**: A FastAPI-based API that accesses OpenStreetMap (OSM) to retrieve locations tagged as "shop" with values "second_hand", "charity", or "thrift."
- **reactTest**: A React application that utilizes the API to display markers on a Leaflet map.
- **WebScraper-demo**: A small web scraping project used for learning purposes.
- **leaflet-demo**: A simple application displaying fixed data on a Leaflet map.

---

## Running the Python API

### **1. Prerequisites**

- Install **Python** on your computer:
  - You can install it via the **Microsoft Store**.
  - Alternatively, type `python` in the terminal; if Python is not installed, you will be redirected to the store.

- Set up a **Python environment** in Visual Studio:
  - Open **Visual Studio**.
  - Navigate to **View → Other Windows → Python Environment**.
  - Create a new environment (choosing the first option is recommended, or follow a tutorial if needed).

---

### **2. Activating the Virtual Environment**

Navigate to the project folder:
```
cd '.\Python API Test\'
```
Activate the environment:
```
.\env\Scripts\Activate
```
### **3. Installing Dependencies**

You need to install the required Python packages. You can install them all at once:
```
pip install fastapi uvicorn pydantic requests geopy
```
If the above command fails, try installing them individually:

```
pip install geopy
pip install fastapi
pip install fastapi[all]
pip install requests
pip install uvicorn
pip install pydantic
```

### **4. Running the API Server**

To start the API, run:
```
uvicorn main:app --reload
```
### **5. Restarting the Environment (If Needed)**

If you close your terminal or restart your system, you will need to reactivate the environment before running the API again:
```
.\env\Scripts\Activate
```

