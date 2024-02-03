import requests
from bs4 import BeautifulSoup
import pandas as pd

def get_twitter_handles(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}

        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an error for bad status codes

        soup = BeautifulSoup(response.content, 'html.parser')
        twitter_links = soup.find_all('a', href=lambda href: href and "twitter.com" in href)

        # Extract only the Twitter profile links, excluding any links to statuses (tweets)
        twitter_handles = [(link['href'].split('/')[-1], link['href'])
                           for link in twitter_links if not "/status/" in link['href']]

        return twitter_handles

    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return []

def create_excel_sheet(twitter_users, file_path):
    message_template = ("Hello there {}👋! Apologies for the direct message. I noticed your flair for content creation "
                    "and would be thrilled if you checked out OscarAI, your AI powered writing tool. We would value "
                    "your opinion highly, if you are open to it. It is meant to amplify your productivity around "
                    "content editing and writing needs. It aims to match ChatGPT's quality at a lower cost. Please "
                    "feel free to explore our website when it suits you. Thank you for your time and understanding! "
                    "Quick Try: https://oscarai.synthminds.in")


    data = {
        "Twitter Link": [user[1] for user in twitter_users],
        "Message": [message_template.format(user[0]) for user in twitter_users]
    }

    df = pd.DataFrame(data)
    df.to_excel(file_path, index=False)
    print(f"Excel file saved as {file_path}")

url = 'https://hypefury.com/blog/en/the-best-twitter-%F0%9D%95%8F-accounts-to-follow/'
twitter_users = get_twitter_handles(url)
file_path = "Twitter_Users_Messages.xlsx"
create_excel_sheet(twitter_users, file_path)
