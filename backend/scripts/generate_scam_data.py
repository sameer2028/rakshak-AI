import csv
import random
import os

# Define categories
categories = ["digital_arrest", "fake_cbi", "phishing", "safe"]

# Templates for synthetic generation
templates = {
    "digital_arrest": [
        "Hello, this is Officer Sharma from {agency}. We have intercepted a package in your name containing {illegal_item}.",
        "An FIR has been filed against you. You are under digital arrest. Do not disconnect the call.",
        "Your Aadhaar card was used to open {num} bank accounts for money laundering. You must transfer a security deposit of Rs {amount} lakh.",
        "To verify your accounts, please send {amount} to our secure RBI escrow account. It will be refunded in 30 minutes.",
        "If you disconnect this Skype call, local police will arrive at your location with an arrest warrant."
    ],
    "fake_cbi": [
        "This is {agency} calling. Your name came up in a human trafficking investigation.",
        "We are calling from {agency} headquarters. We found your mobile number linked to illegal activities.",
        "Sir, we need to record your statement on video call for the {agency} investigation.",
        "You have to pay a penalty of {amount} rupees immediately to close the {agency} case against you.",
        "Share your bank statement and OTP to verify you are not involved in the {agency} money laundering case."
    ],
    "phishing": [
        "Congratulations! You have won a lottery of Rs {amount} lakh. Click the link to claim your prize.",
        "Your {bank} account will be blocked today due to pending KYC. Please share the OTP sent to your mobile.",
        "Dear customer, your electricity bill is unpaid. Power will be cut at 9 PM. Call this number to pay.",
        "This is {bank} customer support. Your credit card points are expiring. Share your card details to redeem them.",
        "We noticed unusual activity on your {bank} account. To stop the transaction, please provide the 6-digit OTP."
    ],
    "safe": [
        "Hi, I'm calling from {delivery} regarding your order. I am at the gate.",
        "Hello, this is {bank} customer service. How can I help you today?",
        "Hey man, what time are we meeting for dinner tonight?",
        "Your OTP for logging into the app is 123456. Do not share this with anyone.",
        "Hi sir, your appointment with Dr. Singh is confirmed for tomorrow at 10 AM.",
        "Thank you for contacting support. We have initiated your refund of Rs 500.",
        "Can you pick up some groceries on your way back home?"
    ]
}

variables = {
    "agency": ["the CBI", "Customs Department", "Enforcement Directorate", "Mumbai Police", "Cyber Crime Branch", "the Supreme Court"],
    "illegal_item": ["5 passports and MDMA", "illegal narcotics", "unlicensed weapons", "smuggled gold", "counterfeit currency"],
    "bank": ["SBI", "HDFC", "ICICI", "Axis Bank", "Paytm", "PhonePe"],
    "delivery": ["Swiggy", "Zomato", "Amazon", "Flipkart", "BlueDart"],
    "num": ["3", "5", "12", "17"],
    "amount": ["2", "5", "10", "50", "98,000", "5,00,000"]
}

def generate_sentence(category):
    template = random.choice(templates[category])
    for var_name, options in variables.items():
        placeholder = "{" + var_name + "}"
        if placeholder in template:
            template = template.replace(placeholder, random.choice(options))
    return template

def generate_dataset(num_samples=1000):
    os.makedirs('app/ml/data', exist_ok=True)
    filepath = 'app/ml/data/scam_dataset.csv'
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        
        for _ in range(num_samples):
            # 75% scam (split among types), 25% safe
            is_scam = random.random() < 0.75
            
            if is_scam:
                scam_type = random.choice(["digital_arrest", "fake_cbi", "phishing"])
                text = generate_sentence(scam_type)
                writer.writerow([text, scam_type])
            else:
                text = generate_sentence("safe")
                writer.writerow([text, "safe"])
                
    print(f"Generated {num_samples} samples and saved to {filepath}")

if __name__ == "__main__":
    generate_dataset(2000)
