import requests
import os
import json

def get_auth_token():
    login_url = "http://localhost:8080/api/v1/auth/login"
    payload = {
        "email": "admin@gmail.com",
        "password": "Admin123!"
    }
    print(f"Logging in to {login_url}...")
    try:
        response = requests.post(login_url, json=payload)
        print(f"Login Response Code: {response.status_code}")
        print(f"Login Response Body: {response.text}")
        if response.status_code == 200:
            token = response.json().get('data', {}).get('accessToken')
            if token:
                print("Login successful! Token found.")
                return token
            else:
                print("Login successful BUT accessToken not found in response!")
                return None
        else:
            print(f"Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_excel_import():
    token = get_auth_token()
    if not token:
        print("Aborting test due to login failure.")
        return

    url = "http://localhost:8080/api/v1/admin/products/import"
    file_path = os.path.join('test_data', 'products_with_images_v3.xlsx')
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print(f"Uploading {file_path} to {url}...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            response = requests.post(url, files=files, headers=headers)
            
        print(f"Status Code: {response.status_code}")
        try:
            result = response.json()
            print("Response JSON:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            if response.status_code == 200:
                print("\nSUCCESS: Import request completed.")
                # Verify products
                verify_products(token)
            else:
                print(f"\nFAILURE: Import failed with status {response.status_code}")
                
        except json.JSONDecodeError:
            print("Response is not JSON:")
            print(response.text)
            
    except Exception as e:
        print(f"An error occurred: {e}")

def verify_products(token):
    print("\nVerifying imported products (Admin view)...")
    url = "http://localhost:8080/api/v1/admin/products?page=0&size=100"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            # The admin response might have a different structure (e.g. data.content)
            products = data.get('data', {}).get('content', [])
            if not products and 'content' in data:
                products = data['content']
            
            print(f"Total products fetched for verification: {len(products)}")
            
            test_names = ['Kính Mát Chống UV Cao Cấp V1', 'Gọng Kính Cận Thời Trang V1']
            found_count = 0
            
            for p in products:
                name = p.get('name', '')
                for test_name in test_names:
                    if test_name.lower() in name.lower():
                        print(f"Found Match: '{name}'")
                        print(f"  ID: {p.get('id')}")
                        # Admin view might show variant images
                        print(f"  Result: {p}")
                        found_count += 1
                        break
            
            if found_count >= len(test_names):
                print("\nFINAL VERIFICATION: All test products found in Admin list!")
            else:
                print(f"\nFINAL VERIFICATION: Only {found_count}/{len(test_names)} test products found.")
                print("First 5 product names found:")
                for p in products[:5]:
                    print(f" - {p.get('name')}")
        else:
            print(f"Failed to fetch admin products: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Verification error: {e}")

if __name__ == "__main__":
    test_excel_import()
