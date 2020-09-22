ENV_FILE="templates/vue/.env"
echo "Please enter your LinkPreview API key (linkpreview.net):"
read key
if [[ -f "$ENV_FILE" ]]; then
    rm "$ENV_FILE"
fi
echo "LINK_PREVIEW_API_KEY=$key" > "$ENV_FILE"