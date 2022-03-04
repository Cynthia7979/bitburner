def isPrime(x):
    # invalid input
    if x <= 1:
        return False

    # process all potential divisors
    for i in range(2,x):
        if x % i == 0:
            return False 
      

    # no divisor found, therfore it's a prime number
    return True
# the number to we want largest prime factor of
number = 502169539

# a list to store all the prime factors of a number
Factors=[]
Factors.append(1)
# iterate from 2 to half of the number as there can be no factor
# greater than half of the number.
for i in range(2, number//2 + 1):
    # check if number is a factor
    if number % i == 0:
        # check if factor is also a prime
        if isPrime(i)==True:
            # add the number to the list
            Factors.append(i)
# output the maximum of the factors to obtain largest prime factor
print("Largest Prime Factor =",max(Factors))
