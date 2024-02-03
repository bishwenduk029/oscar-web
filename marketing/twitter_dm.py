import tweepy
import pandas as pd

# Authenticate to Twitter
auth = tweepy.OAuthHandler("w5JMqVhd2mBiXzHYNBT41J2MD", "ZdlBgFtQl1H6PH9ugHzghE8VrtYVeJ6OdstzaGBEOxjl78DDDY")
auth.set_access_token("1736472282196049920-vPWv7z9MjkMcbWhqUiH6BuvbJX6YLU", "8wtizvOvrrrj6SHdsKQOzE456DSLWDPs15H84w4POcUtn")
api = tweepy.API(auth)

# Read the Excel sheet
df = pd.read_excel('Twitter_Users_Messages.xlsx')

# Initialize counters
success_count = 0
failure_count = 0

# Iterate through the handles and messages
for index, row in df.iterrows():
    handle = row['Twitter Link']
    message = row['Message']
    try:
        # Send DM
        print(handle, message)
        api.send_direct_message(handle, text=message)
        success_count += 1
    except Exception as e:
        # Print the handle that failed
        print(f"Failed to send DM to: {handle}")
        print(e)
        failure_count += 1

# Print the success and failure metrics
print(f"Total Success: {success_count}")
print(f"Total Failures: {failure_count}")
