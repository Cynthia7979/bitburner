"""Total Ways to Sum - 18"""
from math import ceil

combinations = []

def split(num, other_parts=[]):
    for a in range(1, ceil(num/2.0)):
        current_combination = [a, num-a]+other_parts
        current_combination.sort()
        if current_combination not in combinations:
            combinations.append(current_combination)
        if a != 1:
            split(a, [num-a]+other_parts)
        if num-a!=1:
            split(num-a, [a]+other_parts)
    print(combinations)

def main():
    split(18)
    print(combinations)
    print(len(combinations))

if __name__ == '__main__':
    main()
