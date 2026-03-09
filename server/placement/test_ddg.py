from ddgs import DDGS
with DDGS() as ddgs:
    try:
        results = list(ddgs.text("tcs placement", max_results=5))
        print(results)
    except Exception as e:
        print(f"Error: {e}")
